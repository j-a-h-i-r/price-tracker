import type { FastifyInstance, FastifyRequest } from 'fastify';
import { scrapers } from '../scrapers/index.ts';
import { knex } from '../core/db.ts';

export default async function routes(fastify: FastifyInstance) {
    fastify.get('/', async () => {
        const websites = scrapers.map(({ website }) => {
            return {
                ...website,
                id: website.website_id, // same formatting as other stuff
            };
        });
        return websites;
    });

    fastify.get('/:id/products', async (req: FastifyRequest<{ Params: { id: string } }>) => {
        const websiteId = req.params.id;
        return knex
            .select('*')
            .from('external_products')
            .where({website_id: websiteId});
    });

    fastify.get('/:id/summary', async (req: FastifyRequest<{ Params: { id: string } }>) => {
        const websiteId = req.params.id;
        const summary = await knex('external_products')
            .where({ website_id: websiteId })
            .select(knex.raw('COUNT(DISTINCT url) as total_products, COUNT(DISTINCT category_id) as total_categories'))
            .first();
        return summary;
    });
}
