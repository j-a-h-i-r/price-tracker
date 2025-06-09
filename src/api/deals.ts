import type { FastifyInstance, FastifyRequest } from 'fastify';
import { getAllDeals } from '../services/deal.service.ts';
import { z } from 'zod';
import { cache } from '../core/cache.ts';

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
            const queryString = JSON.stringify({days, sortby});
            const cacheKey = `deals:${queryString}`;
            const cachedDeals = cache.get(cacheKey);
            if (cachedDeals) {
                return cachedDeals;
            }
            const { tracer } = req.opentelemetry();
            const dbSpan = tracer.startSpan('database');
            const deals = await getAllDeals(days, sortby);
            dbSpan.end();
            cache.set(cacheKey, deals);
            return deals;
        }
    );
}
