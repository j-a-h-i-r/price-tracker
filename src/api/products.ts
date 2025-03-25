import { FastifyInstance, FastifyRequest } from 'fastify';
import { knex } from '../core/db.js';

type GpuQuery = { name?: string, url?: string, slug?: string, website?: string };

interface PriceParams {
    id: string;
}

interface PriceQuery {
    from?: string;
    to?: string;
    limit?: number;
}

interface CreatePriceBody {
    price: number;
    is_available: boolean;
    external_product_id: number;
}

export default async function routes(fastify: FastifyInstance, options: any) {
    fastify.get('/', async (req: FastifyRequest<{ Querystring: GpuQuery }>, res) => {
        return knex
            .select('*')
            .from('internal_products');
    });

    fastify.get<{ Params: { id: string } }>('/:id/matches', async (req, res) => {
        // figure out external products across all websites that are possibly the same product
        // based on product name
        const id = req.params?.id;
        const product = await knex('external_products')
            .where('id', id)
            .first();
        const { name, website_id, internal_product_id, category_id } = product;
        return knex
            .select('id', 'name', 'website_id', knex.raw('similarity(ep.name, ?) AS similarity', [name]))
            .from('external_products AS ep')
            .where(knex.raw('ep.name % ?', [name]))
            .andWhere('ep.website_id', '<>', website_id)
            .andWhere('ep.category_id', '=', category_id)
            .orderBy('similarity', 'desc');
    });

    // Get all prices for a product with optional date range and limit
    fastify.get<{ Params: PriceParams; Querystring: PriceQuery }>(
        '/:id/prices',
        async (req, reply) => {
            const { id } = req.params;
            const { from, to, limit = 100 } = req.query;

            let query = knex
                .select('p.id', 'p.price', 'p.is_available', 'p.created_at')
                .from('prices as p')
                .innerJoin('external_products as ep', 'ep.id', 'p.external_product_id')
                .where('ep.internal_product_id', id)
                .orderBy('p.created_at', 'desc')
                .limit(limit);

            if (from) {
                query = query.where('p.created_at', '>=', from);
            }
            if (to) {
                query = query.where('p.created_at', '<=', to);
            }

            return query;
        }
    );

    // Get a specific price record
    fastify.get<{ Params: { id: string; priceId: string } }>(
        '/:id/prices/:priceId',
        async (req, reply) => {
            const { id, priceId } = req.params;

            const price = await knex
                .select('p.*')
                .from('prices as p')
                .innerJoin('external_products as ep', 'ep.id', 'p.external_product_id')
                .where('ep.internal_product_id', id)
                .andWhere('p.id', priceId)
                .first();

            if (!price) {
                reply.code(404).send({ error: 'Price not found' });
                return;
            }

            return price;
        }
    );

    // Create a new price record
    fastify.post<{ Params: PriceParams; Body: CreatePriceBody }>(
        '/:id/prices',
        async (req, reply) => {
            const { id } = req.params;
            const { price, is_available, external_product_id } = req.body;

            const product = await knex('internal_products')
                .where('id', id)
                .first();

            if (!product) {
                reply.code(404).send({ error: 'Product not found' });
                return;
            }

            const [priceId] = await knex('prices')
                .insert({
                    price,
                    is_available,
                    external_product_id,
                    created_at: new Date()
                })
                .returning('id');

            return {
                id: priceId,
                price,
                is_available,
                external_product_id,
                created_at: new Date()
            };
        }
    );

    // Delete a price record
    fastify.delete<{ Params: { id: string; priceId: string } }>(
        '/:id/prices/:priceId',
        async (req, reply) => {
            const { id, priceId } = req.params;

            const deleted = await knex('prices')
                .where('id', priceId)
                .del();

            if (!deleted) {
                reply.code(404).send({ error: 'Price not found' });
                return;
            }

            reply.code(204);
        }
    );

    // Get price statistics
    fastify.get<{ Params: PriceParams }>(
        '/:id/prices/stats',
        async (req, reply) => {
            const { id } = req.params;

            const stats = await knex('prices as p')
                .select(
                    knex.raw('MIN(p.price) as min_price'),
                    knex.raw('MAX(p.price) as max_price'),
                    knex.raw('AVG(p.price) as avg_price'),
                    knex.raw('COUNT(*) as total_records')
                )
                .innerJoin('external_products as ep', 'ep.id', 'p.external_product_id')
                .where('ep.internal_product_id', id)
                .first();

            return stats;
        }
    );
}
