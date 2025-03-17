import { FastifyInstance } from 'fastify';
import fastifyHelmet from 'fastify-helmet';
import gpuRoutes from './gpu';
import gpuModelRoutes from './model';
import productRoutes from './products';
import websiteRoutes from './websites';
import priceRoutes from './prices';

export default async function routes(fastify: FastifyInstance, options: any) {
    fastify.register(fastifyHelmet);
    fastify.register(websiteRoutes, { prefix: '/websites' });
    fastify.register(productRoutes, { prefix: '/products' });
    fastify.register(priceRoutes, { prefix: '/prices' });
    fastify.register(gpuRoutes, { prefix: '/gpus' });
    fastify.register(gpuModelRoutes, { prefix: '/models' });
}
