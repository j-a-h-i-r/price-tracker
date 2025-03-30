import { FastifyInstance } from 'fastify';
import fastifyHelmet from '@fastify/helmet';
import gpuRoutes from './gpu.js';
import gpuModelRoutes from './model.js';
import productRoutes from './products.js';
import websiteRoutes from './websites.js';
import priceRoutes from './prices.js';

export default async function routes(fastify: FastifyInstance, options: any) {
    fastify.register(fastifyHelmet.default);
    fastify.register(websiteRoutes, { prefix: '/websites' });
    fastify.register(productRoutes, { prefix: '/products' });
    fastify.register(priceRoutes, { prefix: '/prices' });
    fastify.register(gpuRoutes, { prefix: '/gpus' });
    fastify.register(gpuModelRoutes, { prefix: '/models' });
}
