import type { FastifyInstance } from 'fastify';
import { ProductService } from '../services/product.service.ts';

export default async function routes(fastify: FastifyInstance) {
    fastify.get('/products', async (req, res) => {
        const user = req.user;
        if (!user) {
            res.code(401).send({ error: 'Unauthorized' });
            return;
        }
        const email = user.email;
        return new ProductService().getUserTrackedProducts(email);
    });
}
