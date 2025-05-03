import { FastifyInstance, FastifyRequest } from 'fastify';
import { knex } from '../core/db.js';

type MetadataQuery = {
    category_id?: string, website_id?: string,
};

export default async function routes(fastify: FastifyInstance) {
    fastify.get('/', async (req: FastifyRequest<{Querystring: MetadataQuery}>, res) => {
        if (!req.isAdmin) {
            return res.status(403).send({ message: 'You are not authorized to access this resource' });
        }
        // Return all metadata
        const { category_id, website_id } = req.query;
        const metadataSet = new Set();
        const metadataQuery = knex
            .select('raw_metadata')
            .from('external_products');
        if (category_id) {
            metadataQuery.where('category_id', category_id);
        }
        if (website_id) {
            metadataQuery.where('website_id', website_id);
        }
        const metadatas = await metadataQuery;
        metadatas.forEach((item) => {
            const { raw_metadata } = item;
            Object.keys(raw_metadata).forEach((key) => {
                metadataSet.add(key);
            });
        });
        const metadataArray = Array.from(metadataSet);
        return metadataArray;
    });

    fastify.get('/:metadata', async (req: FastifyRequest<{ Params: { metadata: string }, Querystring: MetadataQuery }>, res) => {
        if (!req.isAdmin) {
            return res.status(403).send({ message: 'You are not authorized to access this resource' });
        }
        
        const metadataKey = req.params.metadata;
        const { category_id, website_id } = req.query;
        const metadataQuery = knex
            .select('*')
            .from('external_products')
            .whereRaw('raw_metadata ->> ? IS NOT NULL', [metadataKey]);

        if (category_id) {
            metadataQuery.andWhere('category_id', category_id);
        }
        if (website_id) {
            metadataQuery.andWhere('website_id', website_id);
        }
        return metadataQuery;
    });
}
