import { knex } from '../core/db.js';

export async function getAllDeals() {
    const { rows } = await knex.raw(`
        WITH LatestPrices AS (
            -- Select the most recent price for each external product
            SELECT DISTINCT ON (external_product_id)
                p.external_product_id,
                p.price AS current_price,
                p.created_at
            FROM prices p
            where p.is_available is True
            ORDER BY p.external_product_id, p.created_at DESC
        ),
        AvgPriceLastWeek AS (
            -- Select the minimum price recorded in the last 7 days for each external product
            SELECT
                p.external_product_id,
                MAX(p.price) AS avg_price_last_week
            FROM prices p
            WHERE p.created_at >= NOW() - INTERVAL '7 days'
            GROUP BY p.external_product_id
        )
        -- Select product details where the current price is lower than the minimum price from the last week
        SELECT
            ip.id AS internal_product_id,
            ip.name AS product_name,
            ep.id AS external_product_id,
            ep.url AS product_url,
            w.name AS website_name,
            lp.current_price,
            mpw.avg_price_last_week,
            lp.created_at AS current_price_date
        FROM LatestPrices lp
        JOIN AvgPriceLastWeek mpw ON lp.external_product_id = mpw.external_product_id
        JOIN external_products ep ON lp.external_product_id = ep.id
        JOIN internal_products ip ON ep.internal_product_id = ip.id
        JOIN websites w ON ep.website_id = w.id
        WHERE
            lp.current_price < mpw.avg_price_last_week -- Ensure current price is strictly lower than the minimum of the past week
        ORDER BY
            mpw.avg_price_last_week - lp.current_price desc, ip.name asc, w.name asc;
    `);
    
    return rows;
}