import type { DealsQuery } from '../api/deals.ts';
import { knex } from '../core/db.ts';
import type { CurrentDeal } from '../types/deal.types.ts';

/**
 * 
 * @param days - Number of days to look back for price comparison
 * @returns 
 */
export async function getAllDeals(filter: DealsQuery): Promise<CurrentDeal[]> {
    const { days, sortby, manufacturer_id, category_id } = filter;
    let priceSortString = '';
    if (sortby === 'value') {
        priceSortString = 'mpw.max_price_last_days - lp.current_price desc';
    } else if (sortby === 'percentage') {
        priceSortString = '((mpw.max_price_last_days - lp.current_price) / mpw.max_price_last_days) desc';
    }
    const { rows } = await knex.raw(`
        WITH LatestPrices AS (
            -- Select the most recent price for each external product
            SELECT DISTINCT ON (external_product_id)
                p.external_product_id,
                p.price AS current_price,
                p.created_at,
                p.is_available
            FROM prices p
            ORDER BY p.external_product_id, p.created_at DESC
        ),
        MaxPriceLastDays AS (
            -- Select the maximum price recorded in the last n days for each external product
            SELECT
                p.external_product_id,
                MAX(p.price) AS max_price_last_days
            FROM prices p
            WHERE p.created_at >= NOW() - INTERVAL '? days'
            GROUP BY p.external_product_id
        )
        -- Select product details where the current price is lower than the minimum price from the last week
        SELECT
            ip.id AS product_id,
            ip.name AS product_name,
            ep.url AS product_url,
            w.name AS website_name,
            lp.current_price,
            mpw.max_price_last_days,
            lp.created_at AS current_price_date,
            lp.is_available,
            ip.category_id,
            ip.manufacturer_id
        FROM LatestPrices lp
        JOIN MaxPriceLastDays mpw ON lp.external_product_id = mpw.external_product_id
        JOIN external_products ep ON lp.external_product_id = ep.id
        JOIN internal_products ip ON ep.internal_product_id = ip.id
        JOIN websites w ON ep.website_id = w.id
        WHERE
            lp.current_price < mpw.max_price_last_days
            AND lp.is_available IS TRUE -- doesn't make sense to show unavailable products
            ${category_id ? knex.raw('AND ip.category_id = ?', category_id) : ''}
            ${manufacturer_id ? knex.raw('AND ip.manufacturer_id = ?', manufacturer_id) : ''}
        ORDER BY
            ${priceSortString}, ip.name asc, w.name asc;
    `, [knex.raw(days)]);
    
    return rows;
}