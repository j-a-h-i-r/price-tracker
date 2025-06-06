import cookie from '@fastify/cookie';
import { FastifyInstance } from 'fastify';
import fastifyHelmet from '@fastify/helmet';
import productRoutes from './products.js';
import websiteRoutes from './websites.js';
import categoryRoutes from './category.js';
import metadataRoutes from './metadata.js';
import dealRoutes from './deals.js';
import filterRoutes from './filters.js';
import authRoutes from './auth.js';
import statsRoutes from './stats.js';
import userRoutes from './user.js';
import usersRoutes from './users.js';
import potentialSimilarRoutes from './potentialsimilar.js';
import manufacturerRoutes from './manufacturers.js';
import config from '../core/config.js';
import { ZodError } from 'zod';
import jwt from 'jsonwebtoken';
import logger from '../core/logger.js';

export default async function routes(fastify: FastifyInstance) {
    fastify.register(fastifyHelmet.default);
    fastify.register(cookie);

    // Add hook to protect non-GET routes
    fastify.addHook('onRequest', async (request) => {
        request.log.info({ method: request.method, url: request.url }, `[${request.id}] Incoming request - ${request.url}`);
        request.isAdmin = false;
        const authToken = request.cookies?.auth;
        if (authToken && jwt.verify(authToken, config.jwtSecret)) {
            // Token is valid, proceed with the request
            request.user = jwt.decode(authToken) as { email: string };
        }

        const token = request?.cookies?.ADMIN_TOKEN;
        if (token === config.adminToken) {
            request.isAdmin = true;
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
}
