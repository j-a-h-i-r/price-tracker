import { saveOrUpdateGpus, saveOrUpdateGpuPrices, retrieveGpus, retrieveGpu, retrieveGpuPrices } from "./storage";
import type { Gpu, GpuWithPrice } from "../types";
import type * as dbTypes from "../types/db";

export async function getGpus(filter: any) {
    return retrieveGpus(filter);
}

export async function getGpu(gpuId: number): Promise<Gpu | null> {
    const gpu = await retrieveGpu(gpuId);
    if (!gpu || gpu.length === 0) return null;
    return gpu[0];
}

export async function getGpuPrices(gpuId: number) {
    const gpu = await getGpu(gpuId);
    if (!gpu) return null;

    const prices = await retrieveGpuPrices(gpuId);
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

export async function saveGpus(gpusWithPrice: GpuWithPrice[]) {
    const gpus = gpusWithPrice.map((gpu) => {
        const { isAvailable, price, id, ...rest } = gpu;
        return {
            website: "startech",
            ...rest
        }
    });

    const result = await saveOrUpdateGpus(gpus);
    return result;
}


export async function saveGpuPrices(prices: GpuWithPrice[]) {
    const storedGpus = await retrieveGpus();
    const pricesWithId = augmentGpuPricesWithId(storedGpus, prices);
    return saveOrUpdateGpuPrices(pricesWithId);
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