import { StarTech, StartTechWebsite } from './startech';
import { Techland, TechlandWebsite } from './techland';

export const scrapers = [
    {
        website: StartTechWebsite,
        scraper: new StarTech(),
    },
    {
        website: TechlandWebsite,
        scraper: new Techland(),
    }
];

export * from './scraper.types';
export * from './scrape-events';
