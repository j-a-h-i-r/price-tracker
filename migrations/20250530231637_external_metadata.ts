import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .alterTable('external_products', (table) => {
            table.jsonb('parsed_metadata').defaultTo('{}');
            table.jsonb('manual_metadata').defaultTo('{}');
        })
        .alterTable('pending_metadata_reviews', (table) => {
            table.dropUnique(['internal_product_id', 'external_product_id', 'metadata_key']);
            table.dropColumn('internal_product_id');
        });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema
        .alterTable('external_products', (table) => {
            table.dropColumn('parsed_metadata');
            table.dropColumn('manual_metadata');
        })
        .alterTable('pending_metadata_reviews', (table) => {
            table.unique(['internal_product_id', 'external_product_id', 'metadata_key']);
            table.integer('internal_product_id');
        });
}
