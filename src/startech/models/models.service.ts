import * as gpuService from "../service";
import * as gpuModelStorage from "./models.storage";

export async function getGpuModels() {
    return gpuModelStorage.retrieveAllModels();
}

export async function getGpusOfModel(modelId: number) {
    return gpuModelStorage.retrieveGpusOfModel(modelId);
}

export async function saveGpusOfModel(modelId: number, gpuIds: number[]) {
    return gpuModelStorage.saveOrUpdateGpusOfModel(modelId, gpuIds);
}

export async function getGpuPricesUnderModel(modelId: number) {
    const gpus = await getGpusOfModel(modelId);
    if (!gpus || gpus.length === 0) {
        return null;
    }

    const gpuIds = gpus.map((gpu) => gpu.id);
    const gpuPromises = gpuIds.map((gpuId) => gpuService.getGpuPrices(gpuId));
    const gpuPrices = await Promise.all(gpuPromises);
    return {
        gpu: gpuPrices
    }
}
