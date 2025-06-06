import { BaseScraper } from './base-scraper.js';
import { Website } from './scraper.types.js';
import { StarTech, } from './startech.js';
import { Techland, } from './techland.js';

const scraperInstances = [new StarTech(), new Techland()];

export const scrapers: {website: Website, scraper: BaseScraper}[] = scraperInstances
    .map(scraper => ({
        website: scraper.getWebsite(),
        scraper,
    }));

export * from './scraper.types.js';
