import { knex } from "../../core/db";
import type * as dbTypes from '../../types/db';

const GPUS_TABLE = "gpus";
const GPU_MODELS_TABLE = "gpu_models";

export async function retrieveAllModels() {
    return knex(GPU_MODELS_TABLE);
}

export async function retrieveGpusOfModel(modelId: number): Promise<dbTypes.Gpus[]> {
    return knex
    .select(`${GPUS_TABLE}.*`)
    .from(GPU_MODELS_TABLE)
    .innerJoin(GPUS_TABLE, `${GPUS_TABLE}.modelid`, `${GPU_MODELS_TABLE}.id`)
    .where(`${GPU_MODELS_TABLE}.id`, "=", modelId);
}

export async function saveOrUpdateGpusOfModel(modelId: number, gpuIds: number[]) {
    return knex<dbTypes.Gpus>(GPUS_TABLE)
    .update({
        modelid: modelId,
    })
    .whereIn("id", gpuIds)
    .returning("*");
}

