import config from '../core/config.js';
import logger from '../core/logger.js';

logger.info('Test job started');
logger.info(config, 'Test job config');
logger.info('Test job finished');
