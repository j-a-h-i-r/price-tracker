import { knex } from '../core/db';
import type { ExceptId, Gpu } from '../types';
import type * as dbTypes from '../types/db';

const GPUS_TABLE = 'gpus';
const GPU_PRICES_TABLES = 'gpu_prices';
const GPU_SUBSCRIPTION_TABLE = 'subscribed_gpus';
const EMAIL_SUBSCRIBERS_TABLE = 'subscribed_emails';
const PENDING_EMAILS_TABLE = 'pending_emails';

export async function retrieveGpus(filter?: {
    name: string,
    url: string,
    slug: string,
    website: string,
}): Promise<dbTypes.Gpus[]> {
    return knex<dbTypes.Gpus>(GPUS_TABLE)
        .select()
        .where(knex.raw('1 = 1'))
        .modify((builder) => {
            Object
                .entries(filter ?? {})
                .forEach(([col, value]) => {
                    if (!value) return;
                    if (col === 'name') {
                        builder.andWhere(col, 'ilike', `%${value}%`);
                    } else {
                        builder.andWhere(col, '=', value);
                    }
                });
        });
}

export async function retrieveGpu(gpuId: number) {
    return knex<dbTypes.Gpus>(GPUS_TABLE)
        .select()
        .where({ id: gpuId });
}

export async function retrieveGpuPrices(gpuId: number, filter?: { startDate: Date | undefined, endDate: Date | undefined }): Promise<dbTypes.GpuPrices[]> {
    return knex<dbTypes.GpuPrices>(GPU_PRICES_TABLES)
        .select()
        .where({ gpuid: gpuId })
        .andWhere('price', '>', 0)
        .modify((builder) => {
            if (filter?.startDate) builder.andWhere('updated_at', '>=', filter.startDate);
            if (filter?.endDate) builder.andWhere('updated_at', '<=', filter.endDate);
        })
        .orderBy('updated_at', 'desc');
}

export async function retrieveLatestGpuPrice(gpuId: number): Promise<dbTypes.GpuPrices[]> {
    return knex<dbTypes.GpuPrices>(GPU_PRICES_TABLES)
    .select()
    .where({ gpuid: gpuId })
    .orderBy('updated_at', 'desc')
    .limit(1);
}

export async function retrieveLatestGpuPriceChanges(): Promise<dbTypes.GpuPriceChange[]> {
    const gpuIdRef = knex.ref('gp.gpuid');
    const priceQuery = knex<dbTypes.GpuPrices>({ gp: GPU_PRICES_TABLES })
        .select('gpuid')
        .select(
            knex
                .select(knex.raw('json_agg(item)'))
                .from(
                    knex<dbTypes.GpuPrices>(GPU_PRICES_TABLES)
                        .select('id', 'is_available', 'price', 'updated_at')
                        .where('gpuid', gpuIdRef)
                        .orderBy('updated_at', 'desc')
                        .limit(2)
                        .as('item')
                )
                .as('changes')
        )
        .groupBy('gpuid');

    const priceWithNameQuery = knex(priceQuery.as('pq'))
        .select('name', 'url', 'pq.*')
        .innerJoin(GPUS_TABLE, `${GPUS_TABLE}.id`, 'gpuid');

    return priceWithNameQuery;
}

export async function retrieveGpuDetailsWithEmailSubcribers(gpuIds: number[]): Promise<dbTypes.GpuEmailSubscriberDetailed[]> {
    return knex
        .select('gpuid', 'emailid', 'email', 'name', 'url')
        .from(GPU_SUBSCRIPTION_TABLE)
        .innerJoin(EMAIL_SUBSCRIBERS_TABLE, `${EMAIL_SUBSCRIBERS_TABLE}.id`, '=', `${GPU_SUBSCRIPTION_TABLE}.emailid`)
        .innerJoin(GPUS_TABLE, `${GPUS_TABLE}.id`, '=', `${GPU_SUBSCRIPTION_TABLE}.gpuid`)
        .whereIn(`${GPU_SUBSCRIPTION_TABLE}.gpuid`, gpuIds);
}

export async function saveOrUpdateGpus(gpus: ExceptId<dbTypes.Gpus>[]): Promise<Gpu[]> {
    return knex<dbTypes.Gpus>(GPUS_TABLE)
        .insert(gpus)
        .onConflict(['slug', 'website'])
        .merge(['name', 'url'])
        .returning('*');
}

export function saveOrUpdateGpuPrices(gpuPrices: ExceptId<dbTypes.GpuPrices>[]): Promise<dbTypes.GpuPrices[]> {
    return knex(GPU_PRICES_TABLES)
        .insert(gpuPrices)
        .returning('*');
}

export async function savePendingEmail(email: string, gpuId: number, verificationCode: string) {
    return knex(PENDING_EMAILS_TABLE)
        .insert({ email: email, gpuid: gpuId, verification_code: verificationCode })
        .returning('*');
}

export async function retrievePendingEmail(email: string) {
    return knex(PENDING_EMAILS_TABLE)
        .select()
        .where({ email: email });
}

export async function removePendingEmail(email: string, gpuId: number) {
    return knex(PENDING_EMAILS_TABLE)
        .delete()
        .where({ email: email, gpuid: gpuId });
}

export async function savePendingEmailToVerified(email: string, gpuId: number) {
    return knex(EMAIL_SUBSCRIBERS_TABLE)
        .insert({});
}

export async function retrieveSubscriber(email: string) {
    return knex(EMAIL_SUBSCRIBERS_TABLE)
        .select()
        .where({ email: email });
}

export async function saveSubscribedEmail(email: string, code: string) {
    return knex(EMAIL_SUBSCRIBERS_TABLE)
        .insert({ email: email, auth_code: code })
        .returning('*');
}

export async function saveGpuSubscription(emailId: number, gpuId: number) {
    return knex(GPU_SUBSCRIPTION_TABLE)
        .insert({ emailid: emailId, gpuid: gpuId })
        .returning('*');
}
