import { saveOrUpdateGpus, saveOrUpdateGpuPrices, retrieveGpus } from "./storage";
import type { Gpu, GpuWithPrice } from "../types";
import type * as dbTypes from "../types/db";

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