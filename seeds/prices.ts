import { Knex } from 'knex';
import { StartTechWebsite } from '../src/scrapers/startech';

const websites = [
    StartTechWebsite,
].map((website) => {
    return {
        id: website.website_id,
        name: website.name,
        url: website.url,
    };
});

export async function seed(knex: Knex): Promise<void> {
    const websiteTable = 'websites';
    await knex(websiteTable).del();

    // Inserts seed entries
    await knex(websiteTable).insert(websites);
};
