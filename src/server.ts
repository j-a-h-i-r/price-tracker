import Fastify from 'fastify';
import routes from './api/index.js';
import logger from './core/logger.js';
import config from './core/config.js';
import devRoutes from './api/_dev.js';
import { fastifyOtelInstrumentation } from './otlp.js';

export async function setupServer() {
    const server = Fastify.default(
        {
            loggerInstance: logger,
        }
    );

    // Register OpenTelemetry instrumentation for Fastify
    server.register(fastifyOtelInstrumentation.plugin())
    

    server.register(routes, { prefix: '/api' });

    if (!config.isProduction) {
        server.register(devRoutes, { prefix: '/_dev' });
    }

    try {
        const PORT: number = process.env.PORT ? Number(process.env.PORT) : 3000;
        const address = config.isProduction? '0.0.0.0': undefined;
        await server.listen({
            port: PORT,
            host: address
        })
    } catch (err) {
        logger.error(err, 'Server failed to start');

        server.log.error(err);
        process.exit(1);
    }
}
