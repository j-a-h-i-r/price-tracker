
import * as cheerio from 'cheerio';
import { BaseScraper, type CategoryLink, type ProductLink } from './base-scraper.ts';
import { type ScrapedProduct, type Website } from './scraper.types.ts';
import logger from '../core/logger.ts';
import { type ProductJob } from '../types/product.types.ts';
import { getCategoryId } from '../constants.ts';

export class Techland extends BaseScraper {
    getWebsite(): Website {
        return {
            website_id: 2,
            name: 'Techland',
            url: 'https://www.techlandbd.com',
        };
    }

    readonly categories: CategoryLink[] = [
        { category: 'Laptop', url: 'https://www.techlandbd.com/brand-laptops' },
        { category: 'Processor', url: 'https://www.techlandbd.com/pc-components/processor' },
        { category: 'Phone', url: 'https://www.techlandbd.com/smartphone-and-tablet/smartphone' },
        { category: 'Monitor', url: 'https://www.techlandbd.com/monitor-and-display/computer-monitor' },
        { category: 'Tablet', url: 'https://www.techlandbd.com/smartphone-and-tablet/tablet-pc' },
        { category: 'Camera', url: 'https://www.techlandbd.com/shop-cameras' },
        { category: 'Keyboard', url: 'https://www.techlandbd.com/accessories/computer-keyboard' },
        { category: 'Air Conditioner', url: 'https://www.techlandbd.com/home-appliance/air-conditioner' },
        { category: 'Gaming Console', url: 'https://www.techlandbd.com/game-zone/gaming-console' },
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
            logger.info(`Found ${categoryProductLinks.length} products in ${categoryName} in Techland`);
            allProductLinks.push(...categoryProductLinks);
            
            // Emit metric for the number of products scraped in this category
            this.emitScrapeMetric(
                categoryName,
                categoryProductLinks.length,
                this.getWebsite().name
            );
        }

        logger.info(`Found total ${allProductLinks.length} products in Techland`);
        for (const link of allProductLinks) {
            const { url: productUrl, category } = link;
            logger.debug(`Scraping ${productUrl}`);
            try {
                const product = await this.parseProductPage(productUrl);
                const productJob = {
                    ...product,
                    category_id: getCategoryId(category.category),
                    website_id: this.getWebsite().website_id,
                };
                yield productJob;
            } catch (error) {
                logger.error(error, `Failed to parse product page. URL: ${productUrl}`);
                continue;
            }
        }
    }

    public async fetchListingPageHtml(url: string, pageNumber: number, limit: number = 100): Promise<string> {
        const pageUrl = `${url}?page=${pageNumber}`;
        const req = await this.fetchWithThrottle(pageUrl);
        return req.body.text();
    }

    private parsePageCount(html: string): number {
        const $ = cheerio.load(html);
        const lastPageNumber = $('nav[aria-label="Pagination"] > ul > li:nth-last-child(2) > button').text().trim();
        if (!lastPageNumber) {
            logger.warn('No pagination found in the listing page');
            return 1; // Default to 1 if no pagination is found
        }
        return Number(lastPageNumber);
    }

    private parsePageLinks(html: string): string[] {
        const $ = cheerio.load(html);
        const cardDivs = $('#product-container > article > div:nth-child(2) > h3 > a');
        const pageLinks: string[] = [];
        cardDivs.each((i, div) => {
            const link = $(div).attr('href') ?? '';
            if (link) pageLinks.push(link);
        });
        return pageLinks;
    }

    async fetchProductPageHtml(pageUrl: string): Promise<string> {
        const req = await this.fetchWithThrottle(pageUrl);
        return req.body.text();
    }

    async parseProductPage(pageUrl: string): Promise<ScrapedProduct> {
        const html = await this.fetchProductPageHtml(pageUrl);
        const $ = cheerio.load(html);

        const infoJsonText = $('head script[type="application/ld+json"]').text().trim();
        if (!infoJsonText) {
            logger.warn(`Not json data found in the product page: ${pageUrl}`);
            throw new Error(`No JSON data found in the product page: ${pageUrl}`);
        }

        const infoJson = JSON.parse(infoJsonText);
        if (!infoJson || !Array.isArray(infoJson) || infoJson.length === 0) {
            logger.warn(`Invalid JSON data found in the product page: ${pageUrl}`);
            throw new Error(`Invalid JSON data found in the product page: ${pageUrl}`);
        }
        const productData = infoJson[0];
        const productName = productData.name;
        
        const specialPrice = productData.offers?.[0]?.price;
        const price = specialPrice ? Number(specialPrice) : null;

        const availability = productData.offers?.[0]?.availability === 'https://schema.org/InStock';
        const brand = productData?.brand?.name;

        const specifications: Record<string, string> = {};
        $('#specification-tab > div > table > tbody').each((_i, tbody) => {
            let specGroup = '';
            $(tbody).find('tr').each((_j, element) => {
                if (_j === 0) {
                    specGroup = $(element).children().first().text().trim();
                    return;
                }
                const row = $(element);
                const key = row.children().first().text().trim();
                const value = row.children().last().text().trim();
                specifications[this.formatSpecKey(specGroup, key)] = value;
            });
        });
        
        return {
            name: productName,
            price: price,
            isAvailable: availability,
            url: pageUrl,
            slug: pageUrl.split('/').pop() ?? '',
            manufacturer: brand,
            raw_metadata: specifications,
        };
    }
}
