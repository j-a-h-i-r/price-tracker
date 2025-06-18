import type { FastifyInstance, FastifyRequest } from 'fastify';
import { ProductService } from '../services/product.service.ts';
import { z } from 'zod';

const AllQuery = z.object({
    min_score: z.number({coerce: true}).min(0).max(1).default(0.6),
});
type AllQuery = z.infer<typeof AllQuery>;

export default async function potentialSimilarRoutes(fastify: FastifyInstance) {
    fastify.get('/', async (req: FastifyRequest<{Querystring: AllQuery}>, res) => {
        if (!req.isAdmin) {
            return res.status(403).send({ message: 'You are not authorized to access this resource' });
        }
        const { min_score } = AllQuery.parse(req.query);
        return new ProductService().getPossibleSimilarProducts({minScore: min_score});
    });

    fastify.post('/', async (req: FastifyRequest<{Body: {productId: string}}>, res) => {
        if (!req.isAdmin) {
            return res.status(403).send({ message: 'You are not authorized to access this resource' });
        }
        return new ProductService().storePossibleSimilarProducts();
    });
}
