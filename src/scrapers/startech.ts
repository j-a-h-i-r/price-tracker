import * as cheerio from 'cheerio';
import { BaseScraper, CategoryLink, ProductLink } from './base-scraper.js';
import { ScrapedProduct, Website } from './scraper.types.js';
import logger from '../core/logger.js';
import { categoriesMap } from '../constants.js';
import { ProductJob } from '../types/product.types.js';

export class StarTech extends BaseScraper {
    readonly categories: CategoryLink[] = [
        {  category: 'Laptop', url: 'https://www.startech.com.bd/laptop-notebook', },
        {  category: 'Monitor', url: 'https://www.startech.com.bd/monitor', },
        {  category: 'Phone', url: 'https://www.startech.com.bd/mobile-phone', },
        { category: 'UPS', url: 'https://www.startech.com.bd/online-ups', },
        {  category: 'Camera', url: 'https://www.startech.com.bd/camera', },
        {  category: 'Tablet', url: 'https://www.startech.com.bd/tablet-pc', },
        {  category: 'Camera', url: 'https://www.startech.com.bd/camera', },
        {  category: 'Keyboard', url: 'https://www.startech.com.bd/accessories/keyboards', },
    ];

    async fetchAllProductLinksForCategory(category: CategoryLink): Promise<string[]> {
        const { url: categoryUrl } = category;
        const firstPageHtml = await this.fetchListingPageHtml(categoryUrl, 1);
        const pageCount = this.parsePageCount(firstPageHtml);
        const productLinks: string[] = [];

        for (let i = 1; i <= pageCount; i++) {
            try {
                // Don't fail if a page fails to load
                const html = await this.fetchListingPageHtml(categoryUrl, i);
                const pageLinks = this.parsePageLinks(html);
                productLinks.push(...pageLinks);
            } catch (error) {
                logger.error(error, `Failed to fetch page ${i} for category ${category.category}`);
            }
        }
        return productLinks;
    }

    async * scrapeProducts(): AsyncGenerator<ProductJob> {
        const allProductLinks: ProductLink[] = [];
        for (const category of this.categories) {
            const { category: categoryName, url: categoryUrl } = category;
            logger.info(`Scraping ${categoryName} category from ${categoryUrl}`);
            const productLinks = await this.fetchAllProductLinksForCategory(category);
            const categoryProductLinks = productLinks.map((link) => ({
                url: link,
                category: category,
            }));
            allProductLinks.push(...categoryProductLinks);
        }

        logger.info(`Found ${allProductLinks.length} products`);
        for (const link of allProductLinks) {
            const { url: productUrl, category } = link;
            try {
                const product = await this.parseProductPage(productUrl);
                const productJob = {
                    ...product,
                    category_id: categoriesMap[category.category],
                    website_id: StartTechWebsite.website_id,
                };
                yield productJob;
            } catch (error) {
                logger.error(error, `Failed to parse product page. URL: ${productUrl}`);
                continue;
            }
        }
    }

    private async fetchListingPageHtml(url: string, pageNumber: number): Promise<string> {
        const pageUrl = `${url}?page=${pageNumber}`;
        const req = await this.fetchWithThrottle(pageUrl);
        return req.body.text();
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

    async parseProductPage(pageUrl: string): Promise<ScrapedProduct> {
        logger.debug(`Scraping ${pageUrl}`);

        const req = await this.fetchWithThrottle(pageUrl);
        const html = await req.body.text();
        const $ = cheerio.load(html);

        return {
            name: $('div.product-short-info > h1[class=\'product-name\']').text().trim(),
            price: this.parsePrice($),
            isAvailable: this.parseAvailability($),
            url: pageUrl,
            slug: pageUrl.split('/').pop() ?? '',
            manufacturer: $('td.product-info-data.product-brand').text().trim(),
            raw_metadata: this.parseSpecifications($),
        };
    }

    private parsePrice($: cheerio.Root): number {
        const priceTxt = $('td.product-info-data.product-price').text().trim();
        const curPriceTxt = priceTxt.match(/^[^\d]?[\d,.]+/gm)?.[0] ?? '';
        return Number(curPriceTxt.replace(/[^\d]/gm, ''));
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
