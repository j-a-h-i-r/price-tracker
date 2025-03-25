import Fastify from 'fastify';
import routes from './api/index.js';
import logger from './core/logger.js';
import config from './core/config.js';
import devRoutes from './api/_dev.js';

export async function setupServer() {
    const server = Fastify.default({
        logger: config.isProduction
        ? true
        : {
            prettyPrint: {
                translateTime: true,
                levelFirst: true,
                ignore: 'pid,hostname',
            }
        }
    });

    server.register(routes, { prefix: '/api' });

    if (!config.isProduction) {
        server.register(devRoutes, { prefix: '/_dev' });
    }

    try {
        const PORT = process.env.PORT ?? 3000;
        const address = config.isProduction? '0.0.0.0': undefined;
        await server.listen(PORT, address);
    } catch (err) {
        logger.error('Server failed to start');
        logger.error(err);

        server.log.error(err);
        process.exit(1);
    }
}
