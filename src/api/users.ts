import { FastifyInstance } from 'fastify';
import { listUsers } from '../services/user.service.js';

export default async function routes(fastify: FastifyInstance) {
    fastify.get('/', async (req, res) => {
        if (!req.isAdmin) {
            res.code(403).send({ error: 'Forbidden' });
            return;
        }
        return listUsers();
    });
}
