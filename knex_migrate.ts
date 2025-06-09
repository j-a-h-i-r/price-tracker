import knex from 'knex';
import knexConfig from './knexfile.ts';
import logger from './src/core/logger.ts';

const env = process.env.NODE_ENV || 'development';
logger.info(`Running migrations in [${env}] environment`);

try {
    await knex(knexConfig.development).migrate.latest();
    logger.info('Migrations completed successfully');
    process.exit(0);
} catch (error) {
    logger.error(error, 'Error running migrations:');
    process.exit(1);
}
