import { FastifyInstance, FastifyRequest } from 'fastify';
import { knex } from '../core/db.js';

type MetadataQuery = {
    category_id?: string, website_id?: string,
};

export default async function routes(fastify: FastifyInstance, options: any) {
    fastify.get('/', async (req: FastifyRequest<{Querystring: MetadataQuery}>, res) => {
        // Return all metadata
        let { category_id, website_id } = req.query;
        let metadataSet = new Set();
        const metadataQuery = knex
            .select('metadata')
            .from('external_products')
        if (category_id) {
            metadataQuery.where('category_id', category_id);
        }
        if (website_id) {
            metadataQuery.where('website_id', website_id);
        }
        const metadatas = await metadataQuery;
        metadatas.forEach((item) => {
            const {metadata} = item;
            Object.keys(metadata).forEach((key) => {
                metadataSet.add(key);
            });
        });
        const metadataArray = Array.from(metadataSet);
        return metadataArray;
    });

    fastify.get('/:metadata', async (req: FastifyRequest<{ Params: { metadata: string }, Querystring: MetadataQuery }>, res) => {
        const metadataKey = req.params.metadata;
        let { category_id, website_id } = req.query;
        let metadataQuery = knex
            .select('*')
            .from('external_products')
            .whereRaw(`metadata ->> ? IS NOT NULL`, [metadataKey]);

        if (category_id) {
            metadataQuery.andWhere('category_id', category_id);
        }
        if (website_id) {
            metadataQuery.andWhere('website_id', website_id);
        }
        return metadataQuery;
    });
}
