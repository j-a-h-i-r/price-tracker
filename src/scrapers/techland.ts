
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

    private async fetchListingPageHtml(url: string, pageNumber: number, limit: number = 100): Promise<string> {
        const pageUrl = `${url}?limit=${limit}&page=${pageNumber}`;
        const req = await this.fetchWithThrottle(pageUrl);
        return req.body.text();
    }

    private parsePageCount(html: string): number {
        const $ = cheerio.load(html);
        const lastPageLink = $('#content > div.main-products-wrapper > div.row.pagination-results > div.col-sm-6.text-left > ul > li:last-child > a').attr('href') ?? '';
        const params = new URLSearchParams(lastPageLink.split('?')[1]);
        if (!params.has('page')) {
            logger.warn('No page parameter found in last page link');
            return 1;
        }
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
        const req = await this.fetchWithThrottle(pageUrl);
        const html = await req.body.text();
        const $ = cheerio.load(html);

        const productInfo: Record<string, string> = {};
        $('#product > table > tbody:nth-child(3) > tr').each((i, el) => {
            const key = $(el).children().first().text().trim();
            const value = $(el).children().last().text().trim();
            productInfo[key] = value;
        });

        const specialPrice = productInfo['special price']?.replace(',', '').replace('৳', '');
        const regularPrice = productInfo['product price']?.replace(',', '').replace('৳', '');

        const price = specialPrice ? Number(specialPrice) 
            : (regularPrice ? Number(regularPrice) : null);

        const availability = productInfo['Stock Status'] === 'In Stock';
        const brand = productInfo['Brand'] ?? '';

        const specifications: Record<string, string> = {};
        $('#tab-specification > div > table > tbody').each((_i, tbody) => {
            const thead = $(tbody).prev();
            const specGroup = thead.find('tr > td > strong').first().text().trim() ?? '';
            $(tbody).find('tr').each((_j, element) => {
                const row = $(element);
                const key = row.children().first().text().trim();
                const value = row.children().last().text().trim();
                specifications[`${specGroup} >> ${key}`] = value;
            });
        });
        
        return {
            name: $('#product > table > caption > div > h1').text().trim(),
            price: price,
            isAvailable: availability,
            url: pageUrl,
            slug: pageUrl.split('/').pop() ?? '',
            manufacturer: brand,
            raw_metadata: specifications,
        };
    }
}
