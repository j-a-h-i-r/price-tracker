import { knex } from '../../core/db.js';
import type * as dbTypes from '../../types/db.js';

const GPUS_TABLE = 'gpus';
const GPU_MODELS_TABLE = 'gpu_models';
const GPU_PRICES_TABLE = 'gpu_prices';

interface GpuModel {
    id: number
    name: string
}

export async function retrieveAllModels() {
    return knex(GPU_MODELS_TABLE);
}

export async function retrieveModel(modelId: string) {
    return knex(GPU_MODELS_TABLE)
        .where('id', modelId)
        .first();
}

export async function retrieveAllGpusWithModel() {
    return knex
        .select(`${GPUS_TABLE}.name as gpuname`)
        .select(`${GPUS_TABLE}.id as gpuid`)
        .select(`${GPU_MODELS_TABLE}.id as modelid`)
        .select(`${GPU_MODELS_TABLE}.name as modelname`)
        .from(GPUS_TABLE)
        .leftJoin(
            GPU_MODELS_TABLE,
            `${GPUS_TABLE}.modelid`,
            `${GPU_MODELS_TABLE}.id`
        );
}

export async function retrieveGpusOfModel(modelId: number): Promise<dbTypes.Gpus[]> {
    return knex
    .select(`${GPUS_TABLE}.*`)
    .from(GPU_MODELS_TABLE)
    .innerJoin(GPUS_TABLE, `${GPUS_TABLE}.modelid`, `${GPU_MODELS_TABLE}.id`)
    .where(`${GPU_MODELS_TABLE}.id`, '=', modelId);
}

export async function saveModel(gpu: Omit<GpuModel, 'id'>): Promise<number> {
    return knex
        .insert(gpu)
        .into(GPU_MODELS_TABLE)
        .returning('id')
        .then(([gpu]) => gpu.id);
}

export async function saveOrUpdateGpusOfModel(modelId: number, gpuIds: number[]) {
    return knex<dbTypes.Gpus>(GPUS_TABLE)
    .update({
        modelid: modelId,
    })
    .whereIn('id', gpuIds)
    .returning('*');
}

export async function getFirstTimeModelSeen(modelId: number): Promise<(dbTypes.Gpus & dbTypes.GpuPrices) | undefined> {
    return knex<dbTypes.Gpus>(GPUS_TABLE)
    .innerJoin<dbTypes.GpuPrices>(GPU_PRICES_TABLE, `${GPUS_TABLE}.id`, `${GPU_PRICES_TABLE}.gpuid`)
    .select()
    .where('modelid', modelId)
    .orderBy(`${GPU_PRICES_TABLE}.updated_at`, 'asc')
    .first();
}

export async function getLastTimeModelSeen(modelId: number): Promise<(dbTypes.Gpus & dbTypes.GpuPrices) | undefined> {
    return knex<dbTypes.Gpus>(GPUS_TABLE)
    .innerJoin<dbTypes.GpuPrices>(GPU_PRICES_TABLE, `${GPUS_TABLE}.id`, `${GPU_PRICES_TABLE}.gpuid`)
    .select()
    .where('modelid', modelId)
    .orderBy(`${GPU_PRICES_TABLE}.updated_at`, 'desc')
    .first();
}
