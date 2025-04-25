import { FastifyInstance, FastifyRequest } from 'fastify';
import { ProductService } from '../services/product.service.js';
import { z } from 'zod';

interface PriceQuery {
    from?: string;
    to?: string;
    limit?: number;
}

const IdParam = z.object({
    id: z.string().transform(Number),
});
type IdParam = z.infer<typeof IdParam>;

const StringFilter = z.string();
type StringFilter = z.infer<typeof StringFilter>;
const NumericFilter = z.union([
    z.string().transform(Number),
    z.record(z.enum(['eq', 'gt', 'lt']), z.string().transform(Number))
]);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BooleanFilter = z.boolean();

const ProductQuerySchema = z.object({
    name: StringFilter.optional(),
    price: NumericFilter.optional(),
}).strict();
export type ProductQuery = z.infer<typeof ProductQuerySchema>;

export default async function routes(fastify: FastifyInstance) {
    fastify.get('/', async (req: FastifyRequest<{Querystring: ProductQuery}>) => {
        const parsedQuery = ProductQuerySchema.parse(req.query);
        return new ProductService().getInternalProducts(parsedQuery);
    });

    fastify.get<{ Params: IdParam }>('/:id', async (req, res) => {
        const id = IdParam.parse(req.params).id;
        const product = await new ProductService().getInternalProductById(id);
        if (!product) {
            res.code(404).send({ error: 'Product not found' });
            return;
        }
        return product;
    });

    // fastify.get<{ Params: { id: string } }>('/:id/matches', async (req, res) => {
    //     // figure out external products across all websites that are possibly the same product
    //     // based on product name
    //     const id = req.params?.id;
    //     const product = await knex('external_products')
    //         .where('id', id)
    //         .first();
    //     const { name, website_id, internal_product_id, category_id } = product;
    //     return knex
    //         .select('id', 'name', 'website_id', knex.raw('similarity(ep.name, ?) AS similarity', [name]))
    //         .from('external_products AS ep')
    //         .where(knex.raw('ep.name % ?', [name]))
    //         .andWhere('ep.website_id', '<>', website_id)
    //         .andWhere('ep.category_id', '=', category_id)
    //         .orderBy('similarity', 'desc');
    // });

    // Get all prices for a product with optional date range and limit
    fastify.get<{ Params: IdParam; Querystring: PriceQuery }>(
        '/:id/prices',
        async (req, reply) => {
            const { id } = IdParam.parse(req.params);

            const productPrices = await new ProductService().getInternalProductPrices(id);
            if (!productPrices) {
                reply.code(404).send({ error: 'Product not found' });
                return;
            }
            return productPrices;
        }
    );

    fastify.get<{ Params: IdParam; Querystring: PriceQuery }>(
        '/:id/websites',
        async (req, reply) => {
            const { id } = IdParam.parse(req.params);
            const productWebsites = await new ProductService().getInternalProductWebsites(id);
            if (!productWebsites) {
                reply.code(404).send({ error: 'Product not found' });
                return;
            }
            return productWebsites;
        }
    );

    fastify.get('/syncmetadata', async (req, reply) => {
        return new ProductService().saveNormalizedMetadata();
    });

    // // Get a specific price record
    // fastify.get<{ Params: { id: string; priceId: string } }>(
    //     '/:id/prices/:priceId',
    //     async (req, reply) => {
    //         const { id, priceId } = req.params;

    //         const price = await knex
    //             .select('p.*')
    //             .from('prices as p')
    //             .innerJoin('external_products as ep', 'ep.id', 'p.external_product_id')
    //             .where('ep.internal_product_id', id)
    //             .andWhere('p.id', priceId)
    //             .first();

    //         if (!price) {
    //             reply.code(404).send({ error: 'Price not found' });
    //             return;
    //         }

    //         return price;
    //     }
    // );

    // // Create a new price record
    // fastify.post<{ Params: PriceParams; Body: CreatePriceBody }>(
    //     '/:id/prices',
    //     async (req, reply) => {
    //         const { id } = req.params;
    //         const { price, is_available, external_product_id } = req.body;

    //         const product = await knex('internal_products')
    //             .where('id', id)
    //             .first();

    //         if (!product) {
    //             reply.code(404).send({ error: 'Product not found' });
    //             return;
    //         }

    //         const [priceId] = await knex('prices')
    //             .insert({
    //                 price,
    //                 is_available,
    //                 external_product_id,
    //                 created_at: new Date()
    //             })
    //             .returning('id');

    //         return {
    //             id: priceId,
    //             price,
    //             is_available,
    //             external_product_id,
    //             created_at: new Date()
    //         };
    //     }
    // );

    // // Delete a price record
    // fastify.delete<{ Params: { id: string; priceId: string } }>(
    //     '/:id/prices/:priceId',
    //     async (req, reply) => {
    //         const { id, priceId } = req.params;

    //         const deleted = await knex('prices')
    //             .where('id', priceId)
    //             .del();

    //         if (!deleted) {
    //             reply.code(404).send({ error: 'Price not found' });
    //             return;
    //         }

    //         reply.code(204);
    //     }
    // );

    // // Get price statistics
    // fastify.get<{ Params: PriceParams }>(
    //     '/:id/prices/stats',
    //     async (req, reply) => {
    //         const { id } = req.params;

    //         const stats = await knex('prices as p')
    //             .select(
    //                 knex.raw('MIN(p.price) as min_price'),
    //                 knex.raw('MAX(p.price) as max_price'),
    //                 knex.raw('AVG(p.price) as avg_price'),
    //                 knex.raw('COUNT(*) as total_records')
    //             )
    //             .innerJoin('external_products as ep', 'ep.id', 'p.external_product_id')
    //             .where('ep.internal_product_id', id)
    //             .first();

    //         return stats;
    //     }
    // );
}
