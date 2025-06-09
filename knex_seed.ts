import knex from 'knex';
import knexConfig from './knexfile.ts';
import logger from './src/core/logger.ts';

const env = process.env.NODE_ENV || 'development';
logger.info(`Running seed in [${env}] environment`);

try {
    await knex(knexConfig.development).seed.run();
    logger.info('Seeds completed successfully');
    process.exit(0);
} catch (error) {
    logger.error(error, 'Error running seeds');
    process.exit(1);
}
