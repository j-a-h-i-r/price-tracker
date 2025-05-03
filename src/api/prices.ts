import { FastifyInstance, FastifyRequest } from 'fastify';
import { knex } from '../core/db.js';

type GpuQuery = { name?: string, url?: string, slug?: string, website?: string };

export default async function routes(fastify: FastifyInstance, options: any) {
    fastify.get('/', async (req: FastifyRequest<{ Querystring: GpuQuery }>, res) => {
        if (!req.isAdmin) {
            return res.status(403).send({ message: 'You are not authorized to access this resource' });
        }
        return knex
            .select('*')
            .from('prices');
    });
}
