import { FastifyInstance, FastifyRequest } from 'fastify';
import { getAllDeals } from '../services/deal.service.js';
import { z } from 'zod';

const DealsQuerySchema = z.object({
    days: z.coerce.number().max(30).default(7),
    sortby: z.enum(['value', 'percentage']).default('value'),
}).strict();
type DealsQuery = z.infer<typeof DealsQuerySchema>;

export default async function routes(fastify: FastifyInstance) {
    fastify.get(
        '/',
        async (req: FastifyRequest<{Querystring: DealsQuery}>) => {
            const { days, sortby } = DealsQuerySchema.parse(req.query);
            const deals = await getAllDeals(days, sortby);
            return deals;
        }
    );
}
