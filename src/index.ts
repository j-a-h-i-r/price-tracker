import { setupServer } from './server.js';
import logger from './core/logger.js';
import config from './core/config.js';
import { ScrapedProduct, scrapers } from './scrapers/index.js';
import { setupEverything } from './setup.js';
import { queueEvent, parseEvent } from './events.js';
import { categoriesMap } from './constants.js';

function start() {
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
        let scrapedProducts = 0;
        
        scrapers.forEach(({ website, scraper }) => {
            const scrapingEvent = scraper.scrape();

            scrapingEvent.onProducts(async (category, products) => {
                logger.info(`Got ${products.length} products for ${category} for ${website.name} from the scraper`);
                products.forEach(product => {
                    queueEvent.notify({
                        ...product,
                        category_id: categoriesMap[category],
                        website_id: website.website_id,
                    });
                });
            });

            scrapingEvent.onComplete((allProducts: ScrapedProduct[]) => {
                scrapedProducts += allProducts.length;
                completedScrapers++;
                if (completedScrapers === scrapers.length) {
                    parseEvent.notify(scrapedProducts);
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

start();

export * from './types/product.types.js';
