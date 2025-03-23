import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseScraper, CategoryLink } from './base-scraper';
import { ScrapedProduct, Website } from './scraper.types';
import logger from '../core/logger';

export class StarTech extends BaseScraper {
    readonly categories: CategoryLink[] = [
        // {  category: 'Laptop', url: 'https://www.startech.com.bd/laptop-notebook', },
        // {  category: 'Monitor', url: 'https://www.startech.com.bd/monitor', },
        // {  category: 'Phone', url: 'https://www.startech.com.bd/mobile-phone', },
        {  category: 'UPS', url: 'https://www.startech.com.bd/online-ups', },
        // {  category: 'Camera', url: 'https://www.startech.com.bd/camera', },
        {  category: 'Tablet', url: 'https://www.startech.com.bd/tablet-pc', },
        // {  category: 'Camera', url: 'https://www.startech.com.bd/camera', },
        // {  category: 'Keyboard', url: 'https://www.startech.com.bd/accessories/keyboards', },
    ];

    private async fetchListingPageHtml(url: string, pageNumber: number): Promise<string> {
        const pageUrl = `${url}?page=${pageNumber}`;
        const req = await axios.get(pageUrl);
        return req.data as string;
    }

    private parsePageCount(html: string): number {
        const $ = cheerio.load(html);
        const paginationText = $('div[class=\'bottom-bar\']').find('.text-right').text().trim();
        const match = /\((?<pageNumber>\d+)[^)]+\)/.exec(paginationText);
        return Number(match?.groups?.pageNumber);
    }

    private parsePageLinks(html: string): string[] {
        const $ = cheerio.load(html);
        const cardDivs = $('div[class=\'p-item\']');
        const pageLinks: string[] = [];
        cardDivs.each((i, div) => {
            const link = $(div).find('h4[class=\'p-item-name\'] a').attr('href') ?? '';
            pageLinks.push(link);
        });
        return pageLinks;
    }

    async scrapeCategory(category: string): Promise<ScrapedProduct[]> {
        logger.info(`Scraping ${category}`);
        const firstPageHtml = await this.fetchListingPageHtml(category, 1);
        const pageCount = this.parsePageCount(firstPageHtml);
        const products: ScrapedProduct[] = [];

        for (let i = 1; i <= pageCount; i++) {
            const html = await this.fetchListingPageHtml(category, i);
            const pageLinks = this.parsePageLinks(html);
            const pageProducts = await Promise.all(pageLinks.map(link => this.parseProductPage(link)));
            products.push(...pageProducts);
        }

        logger.info(`Scraped ${products.length} products from ${category}`);
        return products;
    }

    async parseProductPage(pageUrl: string): Promise<ScrapedProduct> {
        logger.debug(`Scraping ${pageUrl}`);
        // await this.waitIfNeeded();
        await this.jitterWait();

        const req = await axios.get(pageUrl);
        const $ = cheerio.load(req.data);
        
        return {
            name: $('div.product-short-info > h1[class=\'product-name\']').text().trim(),
            price: this.parsePrice($),
            isAvailable: this.parseAvailability($),
            url: pageUrl,
            slug: pageUrl.split('/').pop() ?? '',
            manufacturer: $('td.product-info-data.product-brand').text().trim(),
            metadata: this.parseSpecifications($),
        };
    }

    private parsePrice($: cheerio.Root): number {
        const priceTxt = $('td.product-info-data.product-price').text().trim();
        const curPriceTxt = priceTxt.match(/^[^\d]?[\d,.]+/gm)?.[0] ?? '';
        return Number(curPriceTxt.replace(/[^\d]/gm, '')) ?? 0;
    }

    private parseAvailability($: cheerio.Root): boolean {
        return $('td.product-info-data.product-status').text().trim() === 'In Stock';
    }

    private parseSpecifications($: cheerio.Root): Record<string, string> {
        const specifications: Record<string, string> = {};
        $('#specification').find('tr').each((i, el) => {
            if ($(el).children().length == 2) {
                const key = $(el).children().first().text().trim();
                const value = $(el).children().last().text().trim();
                specifications[key] = value;
            }
        });
        return specifications;
    }
}

export const StartTechWebsite: Website = {
    website_id: 1,
    name: 'StarTech',
    url: 'https://www.startech.com.bd',
};
