import cron from 'node-cron';
import logger from './core/logger.js';
import config from './core/config.js';
import dayjs from 'dayjs';
import { parseEvent } from './events.js';
import { parseProducts } from './startech/index.js';
import { saveGpus, saveGpuPrices } from './startech/service.js';

const cronScheduleString = `0 */${config.scrapeHourInterval} * * *`;
logger.debug('Cron Schedule %s', cronScheduleString);

export async function scrapeAndSaveProductsAndPrices() {
    try {
        const timeNow = dayjs().format('YYYY/MM/DD HH:mm:ss');
        logger.info('Starting GPU scraping. Time:', timeNow);

        const parsedGpus = await parseProducts();
        logger.info(`Scraped ${parsedGpus.length} GPUs`);
    
        const storedGpus = await saveGpus(parsedGpus);
        logger.info('Scraped GPUs saved to DB');
    
        const storedGpuPrices = await saveGpuPrices(parsedGpus);
        logger.info('GPU prices saved to DB');

        parseEvent.notify();
    } catch (err) {
        logger.error('Failed to parse/store GPUs in DB');
        logger.error(err);
    }
}

// The flow can be like this
// 1. Setup the queue and the worker
// 2. Setup the scraper
// 3. Set up the cron job. The cron job will trigger the scraping process

const task = cron.schedule(cronScheduleString, () => {
    logger.info('Setting up cron tasks');
    
    scrapeAndSaveProductsAndPrices()
    .then(() => {
        logger.info('Cron task ran successfully!');
    })
    .catch(() => {
        logger.error('Error while running a cron task!');
    });
}, {
    scheduled: false,
});

export function setupTasks() {
    task.start();
}
