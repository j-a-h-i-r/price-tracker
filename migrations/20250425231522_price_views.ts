import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
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
    // This view seems shortsighted now. It is mostly useful for sending
    // data to the frontend. Maybe multiple view with different granularity
    .raw(`
        CREATE OR REPLACE VIEW internal_products_latest_price as
        SELECT
            ip.*,
            json_agg(
                jsonb_build_object(
                    'website_id', ep.website_id,
                    'price', eplp.price,
                    'is_available', eplp.is_available,
                    'created_at', eplp.created_at
                )
            )::jsonb as prices
        FROM
            internal_products ip
        INNER JOIN external_products ep on
            ep.internal_product_id = ip.id
        INNER JOIN external_products_latest_price eplp on
            eplp.external_product_id = ep.id
        GROUP BY
            ip.id;
    `);
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema
    .raw('DROP VIEW internal_products_latest_price;')
    .raw('DROP VIEW external_products_latest_price;');
}

