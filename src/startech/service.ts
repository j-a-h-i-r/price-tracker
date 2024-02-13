import dayjs from "dayjs";
import * as gpuStorage from "./storage";
import type { Gpu, GpuPriceChange, GpuWithPrice } from "../types";
import type * as dbTypes from "../types/db";
import * as util from "../core/util";
import emailer from "../core/email";
import logger from "../core/logger";

export async function getGpus(filter: any) {
    // Ignore unknown properties
    const { name, url, slug, website } = filter;
    return gpuStorage.retrieveGpus({ name, url, slug, website });
}

export async function getGpu(gpuId: number): Promise<Gpu | null> {
    const gpu = await gpuStorage.retrieveGpu(gpuId);
    if (!gpu || gpu.length === 0) return null;
    return gpu[0];
}

async function getLatestGpuPrice(gpuId: number): Promise<dbTypes.GpuPrices | null> {
    const gpuPrice = await gpuStorage.retrieveLatestGpuPrice(gpuId);
    logger.debug({gpuPrice});
    if (!gpuPrice || gpuPrice.length !== 1) return null;
    return gpuPrice[0];
}

export async function getGpuPrices(gpuId: number, filter?: { startDate: Date | undefined, endDate: Date | undefined }) {
    const gpu = await getGpu(gpuId);
    if (!gpu) return null;

    const prices = await gpuStorage.retrieveGpuPrices(gpuId, filter);
    const pricesFormatted = prices.map((gpuPrice) => {
        const { is_available, price, updated_at } = gpuPrice;
        return {
            isAvailable: is_available,
            price: price,
            updatedAt: updated_at,
        }
    })

    const latestGpuPrice = await getLatestGpuPrice(gpuId);
    const isLastAvailable = latestGpuPrice?.is_available ?? false;
    const lastPrice = latestGpuPrice?.price ?? null;

    return {
        ...gpu,
        isAvailable: isLastAvailable,
        lastPrice: lastPrice,
        prices: pricesFormatted,
    }
}

function checkIfAvailabilityChanged(
    currentGpu: dbTypes.PriceChange,
    previousGpu: dbTypes.PriceChange,
) {
    return currentGpu.is_available !== previousGpu.is_available;
}

function checkIfPriceChanged(
    currentGpu: dbTypes.PriceChange,
    previousGpu: dbTypes.PriceChange,
) {
    return currentGpu.price !== previousGpu.price;
}

export async function getLatestGpuChanges(): Promise<GpuPriceChange[]> {
    const latestUpdates = await gpuStorage.retrieveLatestGpuPriceChanges();

    const updatesWithChanges = latestUpdates.filter((gpu) => {
        const { changes } = gpu;
        if (changes.length !== 2) return false;

        const [currentPrice, previousPrice] = changes;

        const availabilityChanged = checkIfAvailabilityChanged(currentPrice, previousPrice);
        const priceChanged = checkIfPriceChanged(currentPrice, previousPrice);

        if (!(availabilityChanged || priceChanged)) return false;
        return true;
    })

    const updatesFormatted = updatesWithChanges.map((gpu) => {
        const [currentGpu, previousGpu] = gpu.changes;
        const isAvailable = currentGpu.is_available;
        const lastPrice = currentGpu.price;
        const previousPrice = previousGpu.price;
        const priceDiff = lastPrice - previousPrice;

        return {
            isAvailable: isAvailable,
            lastPrice: lastPrice,
            previousPrice: previousPrice,
            priceDiff: priceDiff,
            hasPriceChanged: checkIfPriceChanged(currentGpu, previousGpu),
            hasAvailabilityChanged: checkIfAvailabilityChanged(currentGpu, previousGpu),
            ...gpu,
        }
    })

    updatesFormatted.sort((gpu1, gpu2) => {
        if (gpu1.priceDiff < gpu2.priceDiff) return -1;
        if (gpu1.priceDiff > gpu2.priceDiff) return 1;
        return 0;
    })

    console.log(updatesFormatted);

    return updatesFormatted;
}

export async function getGpuEmailSubscribers(gpuIds: number[]) {
    return gpuStorage.retrieveGpuDetailsWithEmailSubcribers(gpuIds);
}

export async function saveGpus(gpusWithPrice: GpuWithPrice[]) {
    const gpus = gpusWithPrice.map((gpu) => {
        const { isAvailable, price, id, ...rest } = gpu;
        return {
            website: "startech",
            modelid: undefined,
            ...rest
        }
    });

    const result = await gpuStorage.saveOrUpdateGpus(gpus);
    return result;
}


export async function saveGpuPrices(prices: GpuWithPrice[]) {
    const storedGpus = await gpuStorage.retrieveGpus();
    const pricesWithId = augmentGpuPricesWithId(storedGpus, prices);
    return gpuStorage.saveOrUpdateGpuPrices(pricesWithId);
}


function augmentGpuPricesWithId(gpus: Gpu[], gpusWithPrice: GpuWithPrice[]): dbTypes.GpuPrices[] {
    const currentDate = new Date();
    const augmented: dbTypes.GpuPrices[] = [];
    gpusWithPrice.forEach((gpu) => {
        const { slug, isAvailable, price } = gpu;
        const gpuId = gpus.find((g) => g.slug === slug)?.id;
        if (gpuId) {
            augmented.push({
                gpuid: gpuId,
                is_available: isAvailable,
                price,
                updated_at: currentDate,
            })
        }
    })
    return augmented;
}

export async function savePendingEmail(email: string, gpuId: number) {
    const verificationCode = await util.generate6DigitCode();
    await gpuStorage.savePendingEmail(email, gpuId, verificationCode);
    return sendVerificationEmail(email, verificationCode);
}

export async function getPendingEmailInfo(email: string) {
    const result = await gpuStorage.retrievePendingEmail(email);
    if (!result || result.length !== 1) {
        return null;
    }

    return result[0];
}

export async function verifyPendingEmailCode(email: string, code: string) {
    const pendingEmail = await getPendingEmailInfo(email);
    if (!pendingEmail) return false;

    const { verification_code, created_at } = pendingEmail;
    if (verification_code !== code) return false;

    const secondsElapsed = dayjs().diff(created_at, "seconds");
    if (secondsElapsed > 60 * 10) return false;

    return true;
}

export async function handleEmailVerification(email: string, code: string, gpuId: number) {
    const verified = await verifyPendingEmailCode(email, code);
    if (!verified) return false;

    const existingEmail = await gpuStorage.retrieveSubscriber(email);
    let emailId;
    if (!existingEmail || existingEmail.length !== 1) {
        // save email
        const authCode = await util.generateAuthCode();
        const saved = await gpuStorage.saveSubscribedEmail(email, authCode);
        emailId = saved[0].id;

        await sendAuthCodeEmail(email, authCode);
    } else {
        emailId = existingEmail[0].id;
    }

    await gpuStorage.saveGpuSubscription(emailId, gpuId);
    await gpuStorage.removePendingEmail(email, gpuId);
    return true;
}

async function sendAuthCodeEmail(email: string, authCode: string) {
    return emailer.send({
        template: "auth-code",
        message: {
            to: email,
        },
        locals: {
            authCode: authCode,
        }
    })
}

async function sendVerificationEmail(email: string, verificationCode: string) {
    return emailer.send({
        template: "verification-code",
        message: {
            to: email,
        },
        locals: {
            verificationCode: verificationCode,
        }
    })
}
