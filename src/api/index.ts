import { FastifyInstance } from 'fastify';
import fastifyHelmet from '@fastify/helmet';
import productRoutes from './products.js';
import websiteRoutes from './websites.js';
import priceRoutes from './prices.js';
import categoryRoutes from './category.js';
import metadataRoutes from './metadata.js';

export default async function routes(fastify: FastifyInstance, options: any) {
    fastify.register(fastifyHelmet.default);
    fastify.register(categoryRoutes, { prefix: '/categories' });
    fastify.register(websiteRoutes, { prefix: '/websites' });
    fastify.register(productRoutes, { prefix: '/products' });
    fastify.register(priceRoutes, { prefix: '/prices' });
    // fastify.register(metadataRoutes, { prefix: '/metadatas' });
}
