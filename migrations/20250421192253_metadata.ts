import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
    // .alterTable('external_products', (table) => {
    //     table.renameColumn('metadata', 'raw_metadata');
    // })
    // .alterTable('internal_products', (table) => {
    //     table.renameColumn('metadata', 'raw_metadata');
    //     table.jsonb('parsed_metadata').defaultTo('{}');
    //     table.jsonb('manual_metadata').defaultTo('{}');
    // })
    // .createTable('pending_metadata_reviews', (table) => {
    //     table.comment('Stores the metadata for to manually verify');
    //     table.increments('id').primary();
    //     table.integer('internal_product_id').notNullable();
    //     table.integer('external_product_id').notNullable();
    //     table.text('metadata_key');
    //     table.text('metadata_value');
    //     table.boolean('is_reviewed').notNullable().defaultTo(false);
    //     table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    //     table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    //     table.unique(['internal_product_id', 'external_product_id', 'metadata_key']);
    // })
    .createViewOrReplace('external_products_latest_price', (view) => {
        view.columns(['external_product_id', 'price', 'created_at']);
        view.as(knex
            .from('prices')
            .select('external_product_id', 'price', 'created_at')
            .where('is_available', true)
            .orderBy('external_product_id')
            .orderBy('created_at', 'desc')
            .distinctOn('external_product_id')
        );
    })
    .createViewOrReplace('internal_products_latest_price', (view) => {  
        view.as(knex
            .select('ip.*', 
                knex.raw('json_agg(jsonb_build_object(\'website_id\', ep.website_id, \'price\', eplp.price, \'created_at\', eplp.created_at))::jsonb as prices')
            )
            .from('internal_products as ip')
            .innerJoin('external_products as ep', 'ip.id', 'ep.internal_product_id')
            .innerJoin('external_products_latest_price as eplp', 'ep.id', 'eplp.external_product_id')
            .groupBy('ip.id')
        );
    });
}


export async function down(knex: Knex): Promise<void> {
}

