
import * as cheerio from 'cheerio';
import { BaseScraper, CategoryLink, ProductLink } from './base-scraper.js';
import { ScrapedProduct, Website } from './scraper.types.js';
import logger from '../core/logger.js';
import { ProductJob } from '../types/product.types.js';
import { getCategoryId } from '../constants.js';

export class Techland extends BaseScraper {
    readonly categories: CategoryLink[] = [
        {  category: 'Laptop', url: 'https://www.techlandbd.com/brand-laptops' },
        {  category: 'Processor', url: 'https://www.techlandbd.com/pc-components/processor' },
        {  category: 'Phone', url: 'https://www.techlandbd.com/smartphone-and-tablet/smartphone' },
        {  category: 'Monitor', url: 'https://www.techlandbd.com/monitor-and-display/computer-monitor' },
        {  category: 'Tablet', url: 'https://www.techlandbd.com/smartphone-and-tablet/tablet-pc' },
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
            logger.debug(`Scraping ${productUrl}`);
            try {
                const product = await this.parseProductPage(productUrl);
                const productJob = {
                    ...product,
                    category_id: getCategoryId(category.category),
                    website_id: TechlandWebsite.website_id,
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

        const req = await this.fetchWithThrottle(pageUrl);
        const html = await req.body.text();
        const $ = cheerio.load(html);

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
            raw_metadata: specifications,
        };
    }
}

export const TechlandWebsite: Website = {
    website_id: 2,
    name: 'Techland',
    url: 'https://www.techlandbd.com',
};
