import { BaseScraper } from './base-scraper.ts';
import { type Website } from './scraper.types.ts';
import { StarTech, } from './startech.ts';
import { Techland, } from './techland.ts';

const scraperInstances = [new StarTech(), new Techland()];

export const scrapers: {website: Website, scraper: BaseScraper}[] = scraperInstances
    .map(scraper => ({
        website: scraper.getWebsite(),
        scraper,
    }));

export * from './scraper.types.ts';
