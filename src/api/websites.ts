import { FastifyInstance, FastifyRequest } from 'fastify';
import { scrapers } from '../scrapers';
import { knex } from '../core/db';

type GpuQuery = { name?: string, url?: string, slug?: string, website?: string };

export default async function routes(fastify: FastifyInstance, options: any) {
    fastify.get('/', async (req: FastifyRequest<{ Querystring: GpuQuery }>, res) => {
        const websites = scrapers.map(({ website }) => {
            return {
                ...website,
                id: website.website_id, // same formatting as other stuff
            };
        });
        return websites;
    });

    fastify.get('/:id/products', async (req, res) => {
        const websiteId = req.params?.id;
        return knex
            .select('*')
            .from('external_products')
            .where({website_id: websiteId});
    });
}
