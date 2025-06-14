import * as cheerio from 'cheerio';
import { BaseScraper, type CategoryLink, type ProductLink } from './base-scraper.ts';
import { type ScrapedProduct, type Website } from './scraper.types.ts';
import logger from '../core/logger.ts';
import { categoriesMap } from '../constants.ts';
import { type ProductJob } from '../types/product.types.ts';

export class Pickaboo extends BaseScraper {
    getWebsite(): Website {
        return {
            website_id: 4,
            name: 'Pickaboo',
            url: 'https://www.pickaboo.com',
        };
    }

    readonly categories: CategoryLink[] = [
        { category: 'Phone', url: 'https://www.pickaboo.com/product/smartphone', },
        // { category: 'Monitor', url: 'https://www.ryans.com/category/monitor-all-monitor', },
        // { category: 'Tablet', url: 'https://www.ryans.com/category/tablet', },
        // { category: 'Keyboard', url: 'https://www.ryans.com/category/desktop-component-keyboard', },
        // { category: 'Processor', url: 'https://www.ryans.com/category/desktop-component-processor' },
    ];

    async fetchAllProductLinksForCategory(category: CategoryLink): Promise<string[]> {
        const { url: categoryUrl } = category;
        const firstPageHtml = await this.fetchListingPageHtml(categoryUrl, 1);
        const pageCount = this.parsePageCount(firstPageHtml) ?? 1;
        logger.info(`Found ${pageCount} pages in ${category.category} category`);
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
            logger.info(`Found ${categoryProductLinks.length} products in ${categoryName} in StarTech`);
            allProductLinks.push(...categoryProductLinks);
            
            this.emitScrapeMetric(
                categoryName,
                categoryProductLinks.length,
                this.getWebsite().name,
            );
        }

        logger.info(`Found total ${allProductLinks.length} products in StarTech`);
        for (const link of allProductLinks) {
            const { url: productUrl, category } = link;
            try {
                const product = await this.parseProductPage(productUrl);
                const productJob = {
                    ...product,
                    category_id: categoriesMap[category.category],
                    website_id: this.getWebsite().website_id,
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
        const lastPageNumber = $('li:nth-last-child(2) > button').text().trim();
        if (lastPageNumber && !isNaN(Number(lastPageNumber))) {
            return Number(lastPageNumber);
        }
        return 1;
    }

    private parsePageLinks(html: string): string[] {
        const $ = cheerio.load(html);
        const aTags = $('div.product-listing-main div.product-one a');
        const pageLinks: string[] = [];
        aTags.each((i, img) => {
            const slug = $(img).attr('href') ?? '';
            if (slug) {
                const fullUrl = this.getWebsite().url + slug;
                pageLinks.push(fullUrl);
            }
        });
        return pageLinks;
    }

    async parseProductPage(pageUrl: string): Promise<ScrapedProduct> {
        logger.debug(`Scraping ${pageUrl}`);

        const req = await this.fetchWithThrottle(pageUrl);
        const html = await req.body.text();
        const $ = cheerio.load(html);

        const priceProp = $('div.price-view > h2:nth-child(1)').text().trim();
        let price: number | null = null;
        const parsedPrice = parseFloat(
            priceProp
            .replace(/^[^\d+]/, '') // Remove any non-numeric characters at the start
            .replace(',', '') // Remove commas
        );
        if (!isNaN(parsedPrice)) {
            price = parsedPrice;
        }

        return {
            name: $('h1.title').text().trim(),
            price: price,
            isAvailable: true,
            url: pageUrl,
            slug: pageUrl.split('/').pop() ?? '',
            manufacturer: $('div.brand-view > p > div > span').text().trim(),
            raw_metadata: this.parseSpecifications($),
        };
    }

    private parseSpecifications($: cheerio.Root): Record<string, string> {
        const specifications: Record<string, string> = {};
        $('section#specification table').each((_i, table) => {
            let specGroupName: string | null = null;
            $(table).find('tr').each((rowNum, row) => {
                if (rowNum === 0) {
                    specGroupName = $(row).find('h3').text().trim();
                } else {
                    const key = $(row).children().first().text().trim();
                    const value = $(row).children().last().text().trim();
                    if (key && value) {
                        specifications[this.formatSpecKey(specGroupName, key)] = value;
                    }
                }
            });
        });
        return specifications;
    }
}
