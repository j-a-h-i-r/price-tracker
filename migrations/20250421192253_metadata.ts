import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
    .alterTable('external_products', (table) => {
        table.renameColumn('metadata', 'raw_metadata');
    })
    .alterTable('internal_products', (table) => {
        table.renameColumn('metadata', 'raw_metadata');
        table.jsonb('parsed_metadata').defaultTo('{}');
        table.jsonb('manual_metadata').defaultTo('{}');
    })
    .createTable('pending_metadata_reviews', (table) => {
        table.comment('Stores the metadata for to manually verify');
        table.increments('id').primary();
        table.integer('internal_product_id').notNullable();
        table.integer('external_product_id').notNullable();
        table.text('metadata_key');
        table.text('metadata_value');
        table.boolean('is_reviewed').notNullable().defaultTo(false);
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
        table.unique(['internal_product_id', 'external_product_id', 'metadata_key']);
    });
}


export async function down(knex: Knex): Promise<void> {
}

