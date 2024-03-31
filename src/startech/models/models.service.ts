import logger from "../../core/logger";
import * as gpuService from "../service";
import * as gpuModelStorage from "./models.storage";

export async function getGpuModels() {
    return gpuModelStorage.retrieveAllModels();
}

export async function retrieveAllGpusWithModel() {
    return gpuModelStorage.retrieveAllGpusWithModel();
}

export async function insertGpuModels(modelId: number,  modelName: string, gpuIds: number[]) {
    let newModelId = null;
    if (!modelId && modelName) {
        newModelId = await gpuModelStorage.saveModel({name: modelName});
        logger.info({newModelId}, "New Model ID");
    }

    let modelIdForInsert: number = modelId ?? newModelId;
    return gpuModelStorage.saveOrUpdateGpusOfModel(modelIdForInsert, gpuIds)
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

export async function getPossibleGpuModels() {
    const gpus = await gpuService.getGpus({});
    const gpuModelRegex = /\b\d+\b/gi;
    const gpusWithModel = gpus.map((gpu) => {
        const gpuName = gpu.name.toLowerCase();
        let manufacturer = '';
        if (
            gpuName.includes("nvidia") || gpuName.includes("geforce") 
        ) {
            manufacturer = 'Nvidia'
        } else if (gpuName.includes("amd") || gpuName.includes("radeon")) {
            manufacturer = 'Amd'
        }
        let possibleModels = gpuName.match(gpuModelRegex);
        let model = possibleModels;
        console.log("model", possibleModels);
        return {
            manufacturer,
            model,
            ...gpu,
        }
    })
    return gpusWithModel;
}