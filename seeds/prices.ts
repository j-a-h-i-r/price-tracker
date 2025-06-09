import { type Knex } from 'knex';
import { categories } from '../src/constants.ts';
import { scrapers } from '../src/scrapers/index.ts';

const websites = scrapers.map(({ website }) => ({
    id: website.website_id,
    name: website.name,
    url: website.url,
}));

export async function seed(knex: Knex): Promise<void> {
    // Inserts seed entries
    await knex('websites')
        .insert(websites)
        .onConflict('name')
        .merge();

    // Add categories
    await knex('categories')
        .insert(categories)
        .onConflict('name')
        .merge();
};
