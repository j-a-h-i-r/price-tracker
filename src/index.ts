import 'dotenv/config'; // Load environment variables from .env file
import { setupServer } from './server.js';
import logger from './core/logger.js';
import config from './core/config.js';
import { setupEverything } from './setup.js';
import { createBatchedProductStream } from './scrapers/scrape-runner.js';
import { pipeline } from 'stream';
import { ScrapedProductsProcessor } from './services/product.processor.js';

function start() {
    if (config.isProduction) {
        setupEverything()
            .then(({ task, otlpSdk }) => {
                otlpSdk.start();
                task.start();
                logger.info('Setup completed');
            })
            .catch((error) => {
                logger.error(error, 'Failed to setup everything');
            });
    } else {
        setupEverything()
            .then(async ({otlpSdk}) => {
                otlpSdk.start();
                // await startScraping();
                logger.info('Scraper triggered once');
            })
            .catch((error) => {
                logger.error(error, 'Failed setup');
            });
    }

    setupServer()
        .then(() => logger.info('Server running'))
        .catch(() => logger.error('Failed to run server'));
}

export function startScraping() {
    return new Promise<void>((resolve, reject) => {

        const scrapedProductsStream = createBatchedProductStream(1000);
        pipeline(scrapedProductsStream, new ScrapedProductsProcessor(), (err) => {
            if (err) {
                logger.error(err, 'Error in pipeline');
                reject(err);
            } else {
                logger.info('Pipeline completed successfully');
                resolve();
            }
        });
    });
}

start();

export * from './types/product.types.js';
