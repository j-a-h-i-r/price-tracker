import { knex } from '../core/db';
import type { ExceptId, Gpu, GpuWithPrice } from '../types';
import type * as dbTypes from '../types/db';

const GPUS_TABLE = "gpus";
const GPU_PRICES_TABLES = "gpu_prices";

export async function retrieveGpus(): Promise<dbTypes.Gpus[]> {
    return knex<dbTypes.Gpus>(GPUS_TABLE).select();
}

export async function retrieveGpuPrices() {
    return knex<dbTypes.GpuPrices>(GPU_PRICES_TABLES).select();
}

export async function saveOrUpdateGpus(gpus: ExceptId<dbTypes.Gpus>[]): Promise<Gpu[]> {
    return knex<dbTypes.Gpus>(GPUS_TABLE)
    .insert(gpus)
    .onConflict(["slug", "website"])
    .merge(["name", "url"])
    .returning("*");
}

export function saveOrUpdateGpuPrices(gpuPrices: ExceptId<dbTypes.GpuPrices>[]): Promise<dbTypes.GpuPrices[]> {
    return knex(GPU_PRICES_TABLES)
    .insert(gpuPrices)
    .returning("*");
}
