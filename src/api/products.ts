import type { FastifyInstance, FastifyRequest } from 'fastify';
import { ProductService } from '../services/product.service.ts';
import { z } from 'zod';
import { ExternalIdParam, IdParam } from './types.ts';
import logger from '../core/logger.ts';
import { cache } from '../core/cache.ts';
import { MetadataDefinitions } from '../services/metadata.service.ts';
import { NumericRangeFilter } from '../types/metadata.types.ts';

interface PriceQuery {
    from?: string;
    to?: string;
    limit?: number;
}

const StringFilter = z.string();
type StringFilter = z.infer<typeof StringFilter>;
export const NumericFilter = z.union([
    z.string().transform(Number),
    z.record(z.enum(['eq', 'gt', 'lt']), z.string().transform(Number))
]);
export type NumericFilter = z.infer<typeof NumericFilter>;
 
const BooleanFilter = z.coerce.boolean();
type BooleanFilter = z.infer<typeof BooleanFilter>;

export const ProductMetadataSchema = z.object(Object.entries(MetadataDefinitions)
.reduce<Record<string, z.ZodType>>((acc, [key, value]) => {
    const { dataType } = value;
    if (dataType === 'integer' || dataType === 'float') {
        acc[key] = NumericFilter;
    } else if (dataType === 'string') {
        acc[key] = StringFilter.optional();
    } else if (dataType === 'boolean') {
        acc[key] = BooleanFilter.optional();
    } else {
        logger.warn(`Unknown metadata type for ${key}: ${dataType}`);
    }
    return acc;
}, {})).strict();

export const ProductQuerySchema = z.object({
    name: StringFilter.optional(),
    price: NumericRangeFilter.optional(),
    limit: z.coerce.number().optional(),
    category_id: z.coerce.number().optional(),
    manufacturer_id: z.coerce.number().optional(),
}).strict();
export type ProductQuery = z.infer<typeof ProductQuerySchema>;

const ProductPutBodySchema = z.object({
    name: z.string().optional(),
}).strict();
export type ProductPutBody = z.infer<typeof ProductPutBodySchema>;

const MergeProductsBodySchema = z.object({
    productIds: z.array(z.number().transform(Number)).nonempty(),
}).strict();
export type MergeProductsBody = z.infer<typeof MergeProductsBodySchema>;

const UnMergeProductsBody = z.object({
    external_product_id: z.coerce.number(),
}).strict();
export type UnMergeProductsBody = z.infer<typeof UnMergeProductsBody>;

const PriceTrackBodySchema = z.object({
    target_price: z.string().or(z.number()).transform(Number),
});
type PriceTrackBody = z.infer<typeof PriceTrackBodySchema>;

const ProductVariantQuerySchema = z.object({
    variants: z.record(z.string(), z.any()).optional(),
    metadata: ProductMetadataSchema.partial().optional(),
});
type ProductVariantQuery = z.infer<typeof ProductVariantQuerySchema>;

export default async function routes(fastify: FastifyInstance) {
    fastify.get('/', async (req: FastifyRequest<{Querystring: ProductQuery}>) => {
        const parsedQuery = ProductQuerySchema.parse(req.query);
        const queryText = JSON.stringify(parsedQuery);
        const cacheKey = `products:${queryText}`;
        const cached = cache.get(cacheKey);
        if (!cached) {
            logger.info(`Cache miss for ${cacheKey}`);
            const products = await new ProductService().getInternalProducts(parsedQuery);
            cache.set(cacheKey, products);
            return products;
        } else {
            logger.info(`Cache hit for ${cacheKey}`);
            return cached;
        }
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

    fastify.put('/:id', async (req: FastifyRequest<{Params: IdParam, Body: ProductPutBody}>, res) => {
        if (!req.isAdmin) {
            return res.code(401).send({ error: 'Unauthorized' });
        }
        
        const { id } = IdParam.parse(req.params);
        const { name } = ProductPutBodySchema.parse(req.body);
        try {
            await new ProductService().updateInternalProduct(id, { name });
            return true;
        }
        catch (error) {
            logger.error(error, 'Failed to update product');
            return res.code(500).send(false);
        }
    });

    fastify.get('/:id/variantattributes', async (req: FastifyRequest<{Params: IdParam}>) => {
        const { id } = IdParam.parse(req.params);
        return new ProductService().getVariantAttributesForProduct(id);
    });

    fastify.post('/:id/track', async (req: FastifyRequest<{Params: IdParam, Body: PriceTrackBody}>, res) => {
        if (!req.user) {
            res.code(401).send({ error: 'Unauthorized' });
            return;
        }
        const { email } = req.user;
        const productId = req.params.id;
        const { target_price: targetPrice } = PriceTrackBodySchema.parse(req.body);
        try {
            await new ProductService().trackProduct(email, productId, targetPrice);
            return true;
        } catch (error) {
            logger.error(error, 'Failed to track product');
            return res.code(500).send(false);
        }
    });

    fastify.delete('/:id/track', async (req: FastifyRequest<{Params: IdParam}>, res) => {
        if (!req.user) {
            res.code(401).send({ error: 'Unauthorized' });
            return;
        }
        const { email } = req.user;
        const productId = req.params.id;
        try {
            await new ProductService().untrackProduct(email, productId);
            return true;
        } catch (error) {
            logger.error(error, 'Failed to untrack product');
            return res.code(500).send(false);
        }
    });

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

    fastify.put('/:id/merge', async (req: FastifyRequest<{Params: IdParam, Body: MergeProductsBody}>, reply) => {
        // This is an admin only endpoint
        if (!req.isAdmin) {
            return reply.code(401).send({ error: 'Unauthorized' });
        }
        const { id } = IdParam.parse(req.params);
        const { productIds } = MergeProductsBodySchema.parse(req.body);
        const productService = new ProductService();
        try {
            await productService.mergeProducts(id, productIds);
            cache.clear(); // Clear cache after merging products
            return true;
        } catch (error) {
            logger.error(error, 'Failed to merge products');
            return reply.code(500).send(false);
        }
    });

    fastify.put('/:id/unmerge', async (req: FastifyRequest<{Params: IdParam, Body: UnMergeProductsBody}>, reply) => {
        // This is an admin only endpoint
        if (!req.isAdmin) {
            return reply.code(401).send({ error: 'Unauthorized' });
        }
        const { id } = IdParam.parse(req.params);
        const { external_product_id } = UnMergeProductsBody.parse(req.body);
        const productService = new ProductService();
        try {
            const newId = await productService.unmergeProducts(id, external_product_id);
            logger.info(`Unmerged product ${id} from external product ${external_product_id}, new ID is ${newId}`);
            cache.clear(); // Clear cache after unmerging products
            return newId;
        } catch (error) {
            logger.error(error, 'Failed to unmerge products');
            return reply.code(500).send(false);
        }
    });

    fastify.put('/:id/ignore', async (req: FastifyRequest<{Params: IdParam, Body: MergeProductsBody}>, reply) => {
        // This is an admin only endpoint
        if (!req.isAdmin) {
            return reply.code(401).send({ error: 'Unauthorized' });
        }
        const { id } = IdParam.parse(req.params);
        const { productIds } = MergeProductsBodySchema.parse(req.body);
        const productService = new ProductService();
        try {
            await productService.ignoreProducts(id, productIds);
            return true;
        } catch (error) {
            logger.error(error, 'Failed to merge products');
            return reply.code(500).send(false);
        }
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

    // Get all external products for a specific internal product
    fastify.get('/:id/externals', async (req: FastifyRequest<{Params: IdParam, Querystring: ProductVariantQuery}>) => {
        const { id } = IdParam.parse(req.params);
        const query = ProductVariantQuerySchema.parse(req.query);
        return new ProductService().getExternalProductsByInternalProductId(id, query.variants);
    });

    // Get all prices for a specific external product
    fastify.get('/:id/externals/:externalid/prices', async (req: FastifyRequest<{Params: ExternalIdParam}>) => {
        const { externalid } = ExternalIdParam.parse(req.params);
        return new ProductService().getExternalProductPrices(externalid);
    });

    fastify.get('/:id/externals/:externalid/metadata', async (req: FastifyRequest<{Params: ExternalIdParam}>) => {
        const { externalid } = ExternalIdParam.parse(req.params);
        return new ProductService().getExternalProductMetadata(externalid);
    });
}
