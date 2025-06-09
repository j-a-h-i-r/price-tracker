import Fastify from 'fastify';
import qs from 'qs';
import routes from './api/index.ts';
import logger from './core/logger.ts';
import config from './core/config.ts';
import { fastifyOtelInstrumentation } from './otlp.ts';

export async function setupServer() {
    const server = Fastify.default(
        {
            loggerInstance: logger,
            querystringParser: (str) => qs.parse(str),
            disableRequestLogging: true,
        }
    );

    // Register OpenTelemetry instrumentation for Fastify
    server.register(fastifyOtelInstrumentation.plugin());

    server.register(routes, { prefix: '/api' });

    try {
        const PORT: number = process.env.PORT ? Number(process.env.PORT) : 3000;
        const address = config.isProduction? '0.0.0.0': undefined;
        await server.listen({
            port: PORT,
            host: address
        });
    } catch (err) {
        logger.error(err, 'Server failed to start');

        server.log.error(err);
        process.exit(1);
    }
}
