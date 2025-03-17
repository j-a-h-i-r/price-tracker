import { setupServer } from './server';
import logger from './core/logger';
import config from './core/config';
import { scrapers } from './scrapers';
import { setupEverything } from './setup';
import { queueEvent } from './events';

if (require.main === module) {
    if (config.isProduction) {
        setupEverything()
            .then(({ task }) => {
                task.start();
                logger.info('Setup completed');
            })
            .catch((error) => {
                logger.error(error, 'Failed to setup everything');
            });
    } else {
        setupEverything()
            .then(async () => {
                await startScraping();
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
        let completedScrapers = 0;
        
        scrapers.forEach(({ website, scraper }) => {
            const scrapingEvent = scraper.scrape();

            scrapingEvent.onProducts(async (category, products) => {
                logger.info(`Got ${products.length} products for ${category} for ${website.name} from the scraper`);
                products.forEach(product => {
                    queueEvent.notify({
                        ...product,
                        website_id: website.website_id,
                    });
                });
            });

            scrapingEvent.onComplete(() => {
                completedScrapers++;
                if (completedScrapers === scrapers.length) {
                    resolve();
                }
            });

            scrapingEvent.onError((error) => {
                logger.error(error, `Failed to scrape ${website.name}`);
                reject(error);
            });
        });
    });
}

export * from './types/product.types';
