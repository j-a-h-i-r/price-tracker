import { FastifyInstance } from 'fastify';
import { ProductService } from '../services/product.service.js';

export default async function statsRoutes(fastify: FastifyInstance) {
    fastify.get('/', async () => {
        return new ProductService().getPossibleSimilarProducts();
    });
}
