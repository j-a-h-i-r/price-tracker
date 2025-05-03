import { FastifyInstance } from 'fastify';
import { ProductService } from '../services/product.service.js';

export default async function statsRoutes(fastify: FastifyInstance) {
    fastify.get('/', async (req, res) => {
        if (!req.isAdmin) {
            return res.status(403).send({ message: 'You are not authorized to access this resource' });
        }
        return new ProductService().getPossibleSimilarProducts();
    });
}
