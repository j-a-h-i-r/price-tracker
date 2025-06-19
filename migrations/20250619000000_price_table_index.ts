import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.table('prices', (table) => {
        table.index(
            ['external_product_id', 'created_at'],
            'idx_prices__external_product_id__created_at'
        );
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.table('prices', (table) => {
        table.dropIndex(
            ['external_product_id', 'created_at'],
            'idx_prices__external_product_id__created_at'
        );
    });
}
