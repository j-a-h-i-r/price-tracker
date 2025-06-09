import { knex } from '../core/db.ts';

export async function getCategoryCount() {
    const count = await knex('categories')
        .count('* as count')
        .first();
    if (count) {
        return Number(count.count);
    }
    return null;
}
