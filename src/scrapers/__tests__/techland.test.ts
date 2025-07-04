import { describe, it, expect, } from 'vitest';
import { Techland } from '../techland.ts';
import { readFile } from 'node:fs/promises';
import type { CategoryLink } from '../base-scraper.ts';

class MockTechland extends Techland {
    fetchListingPageHtml(_url: string, _pageNumber: number): Promise<string> {
        return readFile(__dirname + '/techland.listing.html', {encoding: 'utf-8'});
    }

    fetchProductPageHtml(_pageUrl: string): Promise<string> {
        return readFile(__dirname + '/techland.detail.html', {encoding: 'utf-8'});
    }
}

describe('Test Techland Scraper', () => {
    it('should fetch all product links for a category', async () => {
        const scraper = new MockTechland();
        const category: CategoryLink = { category: 'Tablet', url: 'https://www.techlandbd.com/smartphone-and-tablet/tablet-pc' };
        const productLinks = await scraper.fetchAllProductLinksForCategory(category);
        expect(productLinks.length).toBeGreaterThan(0);
        expect(productLinks.length).toEqual(90);
    });

    it('Should correctly parse product details', async () => {
        const scraper = new MockTechland();
        const productDetails = await scraper.parseProductPage('');
        expect(productDetails).toBeDefined();
        expect(productDetails.name).toBeDefined();
        expect(productDetails.name).toEqual('Apple iPad 11th Gen 128GB ROM WIFI 2025');
        expect(productDetails.price).toEqual(44000);
        expect(productDetails.manufacturer).toEqual('Apple');
        expect(productDetails.isAvailable).toBe(true);
        expect(productDetails.raw_metadata).containSubset({
            'Processor >> Processor Brand': 'Apple',
            'Networking & Connectivity >> WiFi': 'Wi-Fi 802.11 a/b/g/n/ac/6, dual-band, hotspot',
        });
    });
});
