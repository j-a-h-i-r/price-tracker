import { CacheableMemory } from 'cacheable';
export const cache = new CacheableMemory({
    ttl: 1000 * 60 * 60 * 6, // 6 hour. Should be invalidated when a new scrape runs
});
