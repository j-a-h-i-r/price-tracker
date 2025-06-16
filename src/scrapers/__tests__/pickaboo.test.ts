import { readFile } from 'node:fs/promises';
import { Pickaboo } from '../pickaboo.ts';
import { describe, expect, it } from 'vitest';
import type { CategoryLink } from '../base-scraper.ts';

class MockPickaboo extends Pickaboo {
    fetchListingPageHtml(_url: string, _pageNumber: number): Promise<string> {
        return readFile(__dirname + '/pickaboo.listing.html', {encoding: 'utf-8'});
    }

    fetchProductPageHtml(_pageUrl: string): Promise<string> {
        return readFile(__dirname + '/pickaboo.detail.html', {encoding: 'utf-8'});
    }
}

describe('Test Pickaboo Scraper', () => {
    it('should fetch all product links for a category', async () => {
        const scraper = new MockPickaboo();
        const category: CategoryLink = { category: 'Phone', url: 'https://www.pickaboo.com/product/smartphone' };
        const productLinks = await scraper.fetchAllProductLinksForCategory(category);
        expect(productLinks.length).toBeGreaterThan(0);
        expect(productLinks.length).toEqual(160);
    });

    it('Should correctly parse product details', async () => {
        const scraper = new MockPickaboo();
        const productDetails = await scraper.parseProductPage('');
        expect(productDetails).toBeDefined();
        expect(productDetails.name).toBeDefined();
        expect(productDetails.name).toEqual('Samsung Galaxy A26 5G 8GB/128GB');
        expect(productDetails.price).toEqual(34999);
        expect(productDetails.manufacturer).toEqual('Samsung');
        expect(productDetails.isAvailable).toBe(true);
        expect(productDetails.raw_metadata).containSubset({
            'Battery >> Battery mAh': '5000mAh',
            'General >> SKU': 'SGA265G8GB128GB',
            'Body >> Dimensions': '164 x 77.5 x 7.7mm',
        });
    });
});