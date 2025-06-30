import type { FastifyInstance, FastifyRequest } from 'fastify';
import z from 'zod';
import { ProductQuerySchema } from './products.ts';
import { ProductService } from '../services/product.service.ts';
import { MetadataFiltersSchema } from '../services/metadata.service.ts';

const ExternalProductQuery = z.object({
    ...ProductQuerySchema.shape,
    metadata: MetadataFiltersSchema.strict().optional(),
});
export type ExternalProductQuery = z.infer<typeof ExternalProductQuery>;

export default async function routes(fastify: FastifyInstance) {
    fastify.get('/', async (req: FastifyRequest<{Querystring: ExternalProductQuery}>) => {
        const parsedQuery = ExternalProductQuery.parse(req.query);
        return new ProductService().getExternalProducts(parsedQuery);
    });
}
