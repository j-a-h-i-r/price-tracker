import { GpuPrice } from "../types";
import { saveOrUpdateGpus } from "./storage";

export async function saveGpus(gpusWithPrice: GpuPrice[]) {
    const gpus = gpusWithPrice.map((gpu) => {
        const { isAvailable, price, ...rest } = gpu;
        return rest;
    });

    const result = await saveOrUpdateGpus(gpus);
    return result;
}
