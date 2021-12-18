import type { Gpu } from '../types';
import { knex } from '../core/db';

const GPUS_TABLE = "gpus";

export function saveOrUpdateGpus(gpus: Gpu[]) {
    knex(GPUS_TABLE)
    .upsert(gpus)
}
