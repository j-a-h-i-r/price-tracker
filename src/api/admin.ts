import type { FastifyInstance } from 'fastify';
import { logger } from '../core/logger.ts';
import { ProductService } from '../services/product.service.ts';

export default async function routes(fastify: FastifyInstance) {
    // Endpoint to trigger updating of metadata
    fastify.post('/tasks/updatemetadata', async (req, res) => {
        if (!req.isAdmin) {
            return res.status(403).send({ error: 'Unauthorized' });
        }
        try {
            await new ProductService().saveNormalizedMetadata();
            return true;
        } catch (error) {
            logger.error(error, 'Failed to update metadata');
            throw error;
        }
    });
}
