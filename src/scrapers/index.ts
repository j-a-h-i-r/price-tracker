import { StarTech, StartTechWebsite } from './startech.js';
import { Techland, TechlandWebsite } from './techland.js';

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

export * from './scraper.types.js';
