import dayjs from "dayjs";
import * as gpuStorage from "./storage";
import type { Gpu, GpuPriceChange, GpuWithPrice } from "../types";
import type * as dbTypes from "../types/db";
import * as util from "../core/util";
import emailer from "../core/email";

export async function getGpus(filter: any) {
    return gpuStorage.retrieveGpus(filter);
}

export async function getGpu(gpuId: number): Promise<Gpu | null> {
    const gpu = await gpuStorage.retrieveGpu(gpuId);
    if (!gpu || gpu.length === 0) return null;
    return gpu[0];
}

export async function getGpuPrices(gpuId: number) {
    const gpu = await getGpu(gpuId);
    if (!gpu) return null;

    const prices = await gpuStorage.retrieveGpuPrices(gpuId);
    const pricesFormatted = prices.map((gpuPrice) => {
        const { is_available, price, updated_at } = gpuPrice;
        return {
            isAvailable: is_available,
            price: price,
            updatedAt: updated_at,
        }
    })

    const isLastAvailable = pricesFormatted?.[0]?.isAvailable ?? false;

    return {
        ...gpu,
        isAvailable: isLastAvailable,
        prices: pricesFormatted,
    }
}

function checkIfAvailabilityChanged(changes: dbTypes.PriceChange[]) {
    if (changes.length !== 2) return false;
    const [{ is_available: isAvailable }, { is_available: wasAvailable }] = changes;
    const hasAvailabilityChanged = isAvailable !== wasAvailable;
    return hasAvailabilityChanged;
}

function checkIfPriceChanged(changes: dbTypes.PriceChange[]) {
    if (changes.length !== 2) return false;
    const [{ price: currentPrice }, { price: previousPrice }] = changes;
    const hasPriceChanged = currentPrice !== previousPrice;
    return hasPriceChanged;
}

export async function getLatestGpuChanges(): Promise<GpuPriceChange[]> {
    const latestUpdates = await gpuStorage.retrieveLatestGpuPriceChanges();

    const updatesWithChanges = latestUpdates.filter((gpu) => {
        const { changes } = gpu;
        if (changes.length !== 2) return false;

        const availabilityChanged = checkIfAvailabilityChanged(changes)
        const priceChanged = checkIfPriceChanged(changes)

        if (!(availabilityChanged || priceChanged)) return false;
        return true;
    })

    const updatesFormatted = updatesWithChanges.map((gpu) => {
        const isAvailable = gpu.changes[0].is_available;
        const lastPrice = gpu.changes[0].price;
        const previousPrice = gpu.changes[1].price;

        return {
            isAvailable: isAvailable,
            lastPrice: lastPrice,
            previousPrice: previousPrice,
            hasPriceChanged: checkIfPriceChanged(gpu.changes),
            hasAvailabilityChanged: checkIfAvailabilityChanged(gpu.changes),
            ...gpu,
        }
    })
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
