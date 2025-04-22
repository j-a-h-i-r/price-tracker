import cookie from '@fastify/cookie';
import { FastifyInstance } from 'fastify';
import fastifyHelmet from '@fastify/helmet';
import productRoutes from './products.js';
import websiteRoutes from './websites.js';
import priceRoutes from './prices.js';
import categoryRoutes from './category.js';
import metadataRoutes from './metadata.js';
import dealRoutes from './deals.js';
import config from '../core/config.js';
import { AUTH_ERRORS } from '../core/constants.js';
import { ZodError } from 'zod';

export default async function routes(fastify: FastifyInstance, options: any) {
    fastify.register(fastifyHelmet.default);
    fastify.register(cookie);

    // Add hook to protect non-GET routes
    fastify.addHook('onRequest', async (request, reply) => {
        // Skip authentication for GET requests
        if (request.method === 'GET') {
            return;
        }

        const token = request?.cookies?.ADMIN_TOKEN;
        if (token !== config.adminToken) {
            return reply.status(401).send({ error: AUTH_ERRORS.INVALID_TOKEN });
        }
    });

    fastify.setErrorHandler((error, request, reply) => {
        // Handle specific error types
        if (error instanceof ZodError) {
            console.error('ZodError:', error.issues);
            const errorMessage = error.issues
                .map((issue, index) => `${index+1}/ ${issue.message}`)
                .join(', ');
            return reply.status(400).send({ error: `Found following errors: ${errorMessage}` });
        }
        return error;
    })

    fastify.register(categoryRoutes, { prefix: '/categories' });
    fastify.register(websiteRoutes, { prefix: '/websites' });
    fastify.register(productRoutes, { prefix: '/products' });
    fastify.register(priceRoutes, { prefix: '/prices' });
    fastify.register(metadataRoutes, { prefix: '/metadatas' });
    fastify.register(dealRoutes, { prefix: '/deals' });
}
