import { pipeline } from 'stream';
import logger from '../core/logger.ts';
import { createBatchedProductStream } from '../scrapers/scrape-runner.ts';
import { ScrapedProductsProcessor } from '../services/product.processor.ts';

function startScraping() {
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

(async () => {
    try {
        logger.info('Executing Start Scraping Job');
        await startScraping();

        logger.info('Start Scraping Job executed successfully');
    }
    catch (error) {
        logger.error(error, 'Error executing Start Scraping Job');
    }
})();
