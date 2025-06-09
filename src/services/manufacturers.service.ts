import { knex } from '../core/db.ts';

export async function listInternalManufacturers() {
    return await knex
        .from('manufacturers')
        .select('*')
        .orderBy('name');
}

export async function getManufacturerStats(id: number) {
    return await knex
        .count('ep.id as product_count')
        .from('manufacturers as m')
        .innerJoin('external_manufacturers as em', 'm.id', 'em.manufacturer_id')
        .innerJoin('external_products as ep', 'em.id', 'ep.external_manufacturer_id')
        .where('m.id', id)
        .first();
}

export async function mergeManufacturers(manufacturerIdToKeep: number, manufacturerIdsToMerge: number[]) {
    await knex.transaction(async (trx) => {
        // Update all external manufacturers to point to the manufacturerIdToKeep
        await trx('external_manufacturers')
            .whereIn('manufacturer_id', manufacturerIdsToMerge)
            .update({ 
                manufacturer_id: manufacturerIdToKeep,
                updated_at: 'now()',
            });

        await trx('internal_products')
            .whereIn('manufacturer_id', manufacturerIdsToMerge)
            .update({
                manufacturer_id: manufacturerIdToKeep,
                updated_at: 'now()',
            });

        // Delete the manufacturer that is being merged
        await trx('manufacturers')
            .whereIn('id', manufacturerIdsToMerge)
            .del();
    });
}