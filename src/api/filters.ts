import { FastifyInstance } from 'fastify';
import { metadataFilters } from '../services/metadata.service.js';

export default async function routes(fastify: FastifyInstance) {
    // Return a list of filters that can used to filter products
    // 
    fastify.get('/', async (req, res) => {
        return await metadataFilters();
    });
}
