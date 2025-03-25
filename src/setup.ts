import cron from 'node-cron';
import { startScraping } from './index.js';
import { QueueProcessor } from './services/queue.processor.js';
import logger from './core/logger.js';
import config from './core/config.js';

export async function setupEverything() {
    logger.info('Setting up stuff');
    
    // Setup the processor
    const processor = new QueueProcessor();
    logger.info('Product processor set up');

    const task = await setupCron();
    logger.info('Cron job set up');
    logger.info('Set up everything');

    return { task };
}

export async function setupCron() {
    const cronScheduleString = `0 */${config.scrapeHourInterval} * * *`;
    logger.debug('Cron Schedule %s', cronScheduleString);
    
    const task = cron.schedule(cronScheduleString, () => {
        logger.info('Running scheduled scrape');
        startScraping()
            .then(() => logger.info('Scheduled scrape completed'))
            .catch((error) => logger.error(error, 'Scheduled scrape failed'));
    }, {
        scheduled: false,
    });
    
    return task;
}
