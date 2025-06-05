import type { Knex } from 'knex';

// This migration creates a materialized view for the latest prices of external products.

export async function up(knex: Knex): Promise<void> {
    return knex.schema
    .raw('DROP VIEW IF EXISTS internal_products_latest_price;')
    .raw('DROP VIEW IF EXISTS external_products_latest_price;')
    .raw(`
        CREATE MATERIALIZED VIEW external_products_latest_price as
        SELECT DISTINCT ON (external_product_id)
            p.external_product_id,
            ep.internal_product_id,
            ep.website_id,
            p.price,
            p.is_available,
            p.created_at
        FROM prices p
        INNER JOIN external_products ep ON p.external_product_id = ep.id
        ORDER BY p.external_product_id, p.created_at desc;
    `)
    .raw(`
        CREATE UNIQUE INDEX idx_eplp__external_product_id ON external_products_latest_price (external_product_id);
    `)
    .raw(`
        CREATE INDEX idx_eplp__internal_product_id ON external_products_latest_price (internal_product_id);
    `)
    .raw(`
        CREATE INDEX idx_eplp__price ON external_products_latest_price (price);
    `);
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema
    .raw(`
        DROP MATERIALIZED VIEW external_products_latest_price;
    `)
    .raw(`
        CREATE OR REPLACE VIEW external_products_latest_price as
        SELECT DISTINCT ON (external_product_id)
            p.external_product_id,
            p.price,
            p.is_available,
            p.created_at
        FROM prices p
        ORDER BY p.external_product_id, p.created_at desc;
    `)
    .raw('DROP INDEX IF EXISTS idx_eplp__external_product_id;')
    .raw('DROP INDEX IF EXISTS idx_eplp__internal_product_id;')
    .raw('DROP INDEX IF EXISTS idx_eplp__price;');
}
