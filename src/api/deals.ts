import { FastifyInstance } from 'fastify';
import { knex } from '../core/db.js';
import { getAllDeals } from '../services/deal.service.js';

export default async function routes(fastify: FastifyInstance, options: any) {
    fastify.get<{}>(
        '/',
        async (req, reply) => {
            // Get products which have lower price compared to last 
            // 1 week price
            const deals = await getAllDeals();
            console.log('Deals:', deals);
            return deals;
        }
    );
}
