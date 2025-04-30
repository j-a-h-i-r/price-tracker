import { knex } from '../core/db.js';

export async function getCategoryCount() {
    const count = await knex('categories')
        .count('* as count')
        .first();
    if (count) {
        return Number(count.count);
    }
    return null;
}
