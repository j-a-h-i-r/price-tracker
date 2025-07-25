import { knex } from '../core/db.ts';

export async function getWebsiteCount() {
    const count = await knex('websites')
        .count('* as count')
        .first();
    if (count) {
        return Number(count.count);
    }
    return null;
}
