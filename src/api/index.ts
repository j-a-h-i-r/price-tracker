import cookie from '@fastify/cookie';
import type { FastifyInstance } from 'fastify';
import fastifyHelmet from '@fastify/helmet';
import productRoutes from './products.ts';
import websiteRoutes from './websites.ts';
import categoryRoutes from './category.ts';
import metadataRoutes from './metadata.ts';
import dealRoutes from './deals.ts';
import filterRoutes from './filters.ts';
import authRoutes from './auth.ts';
import statsRoutes from './stats.ts';
import userRoutes from './user.ts';
import usersRoutes from './users.ts';
import potentialSimilarRoutes from './potentialsimilar.ts';
import manufacturerRoutes from './manufacturers.ts';
import adminRoutes from './admin.ts';
import config from '../core/config.ts';
import { ZodError } from 'zod';
import jwt from 'jsonwebtoken';
import logger from '../core/logger.ts';

export default async function routes(fastify: FastifyInstance) {
    fastify.register(fastifyHelmet.default);
    fastify.register(cookie);

    // Add hook to protect non-GET routes
    fastify.addHook('onRequest', async (request, response) => {
        request.log.info({ method: request.method, url: request.url }, `[${request.id}] Incoming request - ${request.url}`);
        request.isAdmin = false;

        const adminToken = request?.cookies?.ADMIN_TOKEN;
        if (adminToken === config.adminToken) {
            request.isAdmin = true;
        }

        if (request.url.startsWith('/api/admin') && !request.isAdmin) {
            request.log.warn(`[${request.id}] Unauthorized access attempt to admin route: ${request.url}`);
            return response
                .status(403)
                .send({ error: 'Unauthorized' });
        }

        const authToken = request.cookies?.auth;
        if (authToken) {
            try {
                request.user = jwt.verify(authToken, config.jwtSecret) as { email: string };
            } catch (error) {
                request.log.error(error, 'Error verifying auth token');
            }
        }
    });

    fastify.addHook('onResponse', async (request, reply) => {
        request.log.info({ url: request.url, statusCode: reply.statusCode }, `[${request.id}] [${reply.statusCode}] [${reply.elapsedTime}ms] request completed - ${request.url}`);
    });

    fastify.setErrorHandler((error, request, reply) => {
        // Handle specific error types
        if (error instanceof ZodError) {
            logger.error(error.issues, 'ZodError in API');
            const errorMessage = error.issues
                .map((issue, index) => `${index+1}/ ${issue.message}`)
                .join(', ');
            return reply.status(400).send({ error: `Found following errors: ${errorMessage}` });
        } else if ((error as any)?.file === 'postgres.c') {
            // Error is probably coming from knex/PG
            // Don't want to expose the error to the user
            logger.error(error, 'Postgres error in API');
            if (!config.isProduction) return error;
            return reply.status(500).send({ error: 'Internal error' });
        }
        return error;
    });

    fastify.register(categoryRoutes, { prefix: '/categories' });
    fastify.register(websiteRoutes, { prefix: '/websites' });
    fastify.register(productRoutes, { prefix: '/products' });
    fastify.register(metadataRoutes, { prefix: '/metadatas' });
    fastify.register(dealRoutes, { prefix: '/deals' });
    fastify.register(filterRoutes, { prefix: '/filters' });
    fastify.register(authRoutes, { prefix: '/auth' });
    fastify.register(statsRoutes, { prefix: '/stats' });
    fastify.register(usersRoutes, { prefix: '/users' });
    fastify.register(userRoutes, { prefix: '/user' });
    fastify.register(potentialSimilarRoutes, { prefix: '/potentialsimilar' });
    fastify.register(manufacturerRoutes, { prefix: '/manufacturers' });
    fastify.register(adminRoutes, { prefix: '/admin' });
}
