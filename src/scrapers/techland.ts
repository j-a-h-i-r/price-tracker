import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseScraper, CategoryLink } from './base-scraper.js';
import * as fs from 'fs';
import { ScrapedProduct, Website } from './scraper.types.js';
import logger from '../core/logger.js';

export class Techland extends BaseScraper {
    readonly categories: CategoryLink[] = [
        // {  category: 'Laptop', url: 'https://www.techlandbd.com/brand-laptops' },
        // {  category: 'Processor', url: 'https://www.techlandbd.com/pc-components/processor' }, 
        {  category: 'Phone', url: 'https://www.techlandbd.com/smartphone-and-tablet/smartphone' },
        // {  category: 'Monitor', url: 'https://www.techlandbd.com/monitor-and-display/computer-monitor' },
        {  category: 'Tablet', url: 'https://www.techlandbd.com/smartphone-and-tablet/tablet-pc' },
    ];

    private async fetchListingPageHtml(url: string, pageNumber: number): Promise<string> {
        const pageUrl = `${url}?page=${pageNumber}`;
        const req = await axios.get(pageUrl);
        return req.data as string;
    }

    private parsePageCount(html: string): number {
        const $ = cheerio.load(html);
        const lastPageLink = $('#content > div.main-products-wrapper > div.row.pagination-results > div.col-sm-6.text-left > ul > li:last-child > a').attr('href') ?? '';
        const params = new URLSearchParams(lastPageLink.split('?')[1]);
        return Number(params.get('page'));
    }

    private parsePageLinks(html: string): string[] {
        const $ = cheerio.load(html);
        const cardDivs = $('#content > div.main-products-wrapper > div.main-products.product-grid > div > div > div.caption > div.name > a');
        const pageLinks: string[] = [];
        cardDivs.each((i, div) => {
            const link = $(div).attr('href') ?? '';
            if (link) pageLinks.push(link);
        });
        return pageLinks;
    }

    async parseProductPage(pageUrl: string): Promise<ScrapedProduct> {
        logger.debug(`Scraping ${pageUrl}`);
        // await this.waitIfNeeded();
        await this.jitterWait();

        const req = await axios.get(pageUrl);
        const $ = cheerio.load(req.data);

        const productInfo: Record<string, string> = {};
        $('#product > table > tbody:nth-child(3) > tr').each((i, el) => {
            const key = $(el).children().first().text().trim();
            const value = $(el).children().last().text().trim();
            productInfo[key] = value;
        });

        const price = productInfo['product price']?.replace(',', '').replace('৳', '');
        const availability = productInfo['Stock Status'] === 'In Stock';
        const brand = productInfo['Brand'] ?? '';

        const specifications: Record<string, string> = {};
        $('#tab-specification > div > table > tbody > tr').each((index, element) => {
            const row = $(element);
            const key = row.children().first().text().trim();
            const value = row.children().last().text().trim();
            specifications[key] = value;
        });
        
        return {
            name: $('#product > table > caption > div > h1').text().trim(),
            price: price ? Number(price) : null,
            isAvailable: availability,
            url: pageUrl,
            slug: pageUrl.split('/').pop() ?? '',
            manufacturer: brand,
            metadata: specifications,
        };
    }

    async scrapeCategory(category: string): Promise<ScrapedProduct[]> {
        logger.info(`Scraping ${category}`);
        const firstPageHtml = await this.fetchListingPageHtml(category, 1);
        const pageCount = this.parsePageCount(firstPageHtml);
        const products: ScrapedProduct[] = [];

        for (let i = 1; i <= pageCount; i++) {
            const html = await this.fetchListingPageHtml(category, i);
            const pageLinks = this.parsePageLinks(html);
            logger.debug(`Found ${pageLinks.length} products on page ${i}`);
            console.log(pageLinks);
            const pageProducts = await Promise.all(pageLinks.map(link => this.parseProductPage(link)));
            products.push(...pageProducts);
        }
        logger.info(`Scraped ${products.length} products from ${category}`);
        const productsWithCategory = products.map(product => ({ ...product, category }));
        return productsWithCategory;
    }
}

export const TechlandWebsite: Website = {
    website_id: 2,
    name: 'Techland',
    url: 'https://www.techlandbd.com',
};
