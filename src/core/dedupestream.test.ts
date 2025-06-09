import { describe, it, expect } from 'vitest';
import { DedupeStream } from './dedupestream.ts';

describe('DedupeStream', () => {
    it('should dedupe items based on unique attribute', async () => {
        const dedupeStream = new DedupeStream((item) => item.id);
        
        const items = [
            { id: '1', value: 'a' },
            { id: '2', value: 'b' },
            { id: '3', value: 'c' },
            { id: '1', value: 'd' }, // duplicate id
        ];

        const dedupedItems: any[] = [];

        dedupeStream.on('data', (chunk) => {
            dedupedItems.push(...chunk);
        });

        dedupeStream.on('end', () => {
            expect(dedupedItems).toHaveLength(3);
            expect(dedupedItems).toEqual([
                { id: '1', value: 'a' },
                { id: '2', value: 'b' },
                { id: '3', value: 'c' }
            ]);
        });

        dedupeStream.write(items);
        dedupeStream.end();
    });

    it('should handle empty arrays', async () => {
        const dedupedItems: any[] = [];

        const dedupeStream = new DedupeStream((item) => item.id);
        dedupeStream.on('data', (chunk) => {
            dedupedItems.push(...chunk);
        });

        dedupeStream.on('end', () => {
            expect(dedupedItems).toHaveLength(0);
        });

        dedupeStream.write([]);
        dedupeStream.end();
    });

    it('Should handle large arrays', async () => {
        const dedupedItems: any[] = [];

        const dedupeStream = new DedupeStream((item) => item.id);
        dedupeStream.on('data', (chunk) => {
            dedupedItems.push(...chunk);
        });

        dedupeStream.on('end', () => {
            expect(dedupedItems).toHaveLength(10000);
        });

        const items = Array.from({ length: 10000 }, (_, i) => ({ id: `${i}`, value: `value${i}` }));
        dedupeStream.write(items);
        dedupeStream.end();
    });
});