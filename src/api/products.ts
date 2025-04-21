import { FastifyInstance, FastifyRequest } from 'fastify';
import { knex } from '../core/db.js';
import { ProductService } from '../services/product.service.js';

interface ProductListQuery {
    page?: number;
    limit?: number;
    name?: string;
}

interface PriceParams {
    id: string;
}

interface PriceQuery {
    from?: string;
    to?: string;
    limit?: number;
}

export default async function routes(fastify: FastifyInstance) {
    fastify.get('/', async (req: FastifyRequest<{Querystring: ProductListQuery}>) => {
        const { name } = req.query;
        const products = knex
            .select('*')
            .from('internal_products');
        if (name) {
            products.where('name', 'ILIKE', `%${name}%`);
        }

        return products;
    });

    fastify.get<{ Params: { id: string } }>('/:id', async (req, res) => {
        const id = req.params.id;
        const product = await knex('internal_products')
            .where('id', id)
            .first();
        if (!product) {
            res.code(404).send({ error: 'Product not found' });
            return;
        }
        return product;
    });

    // fastify.get<{ Params: { id: string } }>('/:id/matches', async (req, res) => {
    //     // figure out external products across all websites that are possibly the same product
    //     // based on product name
    //     const id = req.params?.id;
    //     const product = await knex('external_products')
    //         .where('id', id)
    //         .first();
    //     const { name, website_id, internal_product_id, category_id } = product;
    //     return knex
    //         .select('id', 'name', 'website_id', knex.raw('similarity(ep.name, ?) AS similarity', [name]))
    //         .from('external_products AS ep')
    //         .where(knex.raw('ep.name % ?', [name]))
    //         .andWhere('ep.website_id', '<>', website_id)
    //         .andWhere('ep.category_id', '=', category_id)
    //         .orderBy('similarity', 'desc');
    // });

    // Get all prices for a product with optional date range and limit
    fastify.get<{ Params: PriceParams; Querystring: PriceQuery }>(
        '/:id/prices',
        async (req, reply) => {
            const { id } = req.params;

            const { rows } = await knex.raw(`
                SELECT 
                    ip.name,
                    ip.category_id,
                    ip.metadata,
                    ip.id,
                    (
                        SELECT
                        JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'website_id', ep.website_id,
                                'price', p.price,
                                'url', ep.url,
                                'website', w.name,
                                'created_at', p.created_at,
                                'is_available', p.is_available
                            )
                            ORDER BY p.created_at desc
                        )
                        FROM
                            prices p
                        INNER JOIN external_products ep 
                            ON ip.id = ep.internal_product_id
                        INNER JOIN websites w
                            ON w.id = ep.website_id
                        WHERE
                            p.external_product_id = ep.id
                        ) as prices
                FROM
	                internal_products ip
                WHERE
                    ip.id = ?;
            `, [id])
            
            if (rows.length === 0) {
                reply.code(404).send({ error: 'Product not found' });
                return;
            }
            const product = rows[0];
            return product;
        }
    );

    fastify.get<{ Params: PriceParams; Querystring: PriceQuery }>(
        '/:id/websites',
        async (req, reply) => {
            const { id } = req.params;

            const { rows } = await knex.raw(`
                SELECT 
                    ip.id,
                    ip."name",
                    (
                        SELECT JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'website_id', ep.website_id,
                                'website_name', w."name",
                                'product_url', ep.url
                            )
                        )
                        FROM
                            external_products ep 
                        INNER JOIN websites w on w.id = ep.website_id 
                            AND ep.internal_product_id = ip.id
                        ) as websites
                    FROM internal_products ip 
                    WHERE ip.id = ?;
            `, [id])
            
            if (rows.length === 0) {
                reply.code(404).send({ error: 'Product not found' });
                return;
            }
            const product = rows[0];
            return product;
        }
    );

    fastify.get<{ Params: PriceParams; Querystring: PriceQuery }>(
        '/deals',
        async (req, reply) => {
            // Get products which have lower price compared to last 
            // 1 week price
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
            `)
            if (rows.length === 0) {
                reply.code(404).send({ error: 'No deals found' });
                return;
            }
            const products = rows;
            return products;
        }
    );

    fastify.get('/syncmetadata', async (req, reply) => {
        return new ProductService().saveNormalizedMetadata()
    })

    // // Get a specific price record
    // fastify.get<{ Params: { id: string; priceId: string } }>(
    //     '/:id/prices/:priceId',
    //     async (req, reply) => {
    //         const { id, priceId } = req.params;

    //         const price = await knex
    //             .select('p.*')
    //             .from('prices as p')
    //             .innerJoin('external_products as ep', 'ep.id', 'p.external_product_id')
    //             .where('ep.internal_product_id', id)
    //             .andWhere('p.id', priceId)
    //             .first();

    //         if (!price) {
    //             reply.code(404).send({ error: 'Price not found' });
    //             return;
    //         }

    //         return price;
    //     }
    // );

    // // Create a new price record
    // fastify.post<{ Params: PriceParams; Body: CreatePriceBody }>(
    //     '/:id/prices',
    //     async (req, reply) => {
    //         const { id } = req.params;
    //         const { price, is_available, external_product_id } = req.body;

    //         const product = await knex('internal_products')
    //             .where('id', id)
    //             .first();

    //         if (!product) {
    //             reply.code(404).send({ error: 'Product not found' });
    //             return;
    //         }

    //         const [priceId] = await knex('prices')
    //             .insert({
    //                 price,
    //                 is_available,
    //                 external_product_id,
    //                 created_at: new Date()
    //             })
    //             .returning('id');

    //         return {
    //             id: priceId,
    //             price,
    //             is_available,
    //             external_product_id,
    //             created_at: new Date()
    //         };
    //     }
    // );

    // // Delete a price record
    // fastify.delete<{ Params: { id: string; priceId: string } }>(
    //     '/:id/prices/:priceId',
    //     async (req, reply) => {
    //         const { id, priceId } = req.params;

    //         const deleted = await knex('prices')
    //             .where('id', priceId)
    //             .del();

    //         if (!deleted) {
    //             reply.code(404).send({ error: 'Price not found' });
    //             return;
    //         }

    //         reply.code(204);
    //     }
    // );

    // // Get price statistics
    // fastify.get<{ Params: PriceParams }>(
    //     '/:id/prices/stats',
    //     async (req, reply) => {
    //         const { id } = req.params;

    //         const stats = await knex('prices as p')
    //             .select(
    //                 knex.raw('MIN(p.price) as min_price'),
    //                 knex.raw('MAX(p.price) as max_price'),
    //                 knex.raw('AVG(p.price) as avg_price'),
    //                 knex.raw('COUNT(*) as total_records')
    //             )
    //             .innerJoin('external_products as ep', 'ep.id', 'p.external_product_id')
    //             .where('ep.internal_product_id', id)
    //             .first();

    //         return stats;
    //     }
    // );
}
