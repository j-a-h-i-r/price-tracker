import type { FastifyInstance, FastifyRequest } from 'fastify';
import { knex } from '../core/db.ts';

export default async function routes(fastify: FastifyInstance, options: any) {
    fastify.get('/', async (req, res) => {
        return knex('categories')
            .select('categories.*', knex.raw('count(ip.id) as product_count'))
            .innerJoin('internal_products AS ip', 'categories.id', 'ip.category_id')
            .groupBy('categories.id')
            .orderBy('categories.name');
    });

    fastify.get('/:id', async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        const idParam = req.params.id;
        const categoryId = Number(idParam);
        if (!categoryId) {
            return res.status(400).send({ message: `Category id (${idParam}) is not valid` });
        }
        const category = await knex('categories')
            .select('*')
            .where('id', categoryId)
            .orderBy('name')
            .first();
        if (!category) {
            return res.status(404).send({ message: `Category id (${categoryId}) is not found` });
        }
        return category;
    });
}
