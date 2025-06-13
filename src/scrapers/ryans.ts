import * as cheerio from 'cheerio';
import { BaseScraper, type CategoryLink, type ProductLink } from './base-scraper.ts';
import { type ScrapedProduct, type Website } from './scraper.types.ts';
import logger from '../core/logger.ts';
import { categoriesMap } from '../constants.ts';
import { type ProductJob } from '../types/product.types.ts';

export class RyansComputer extends BaseScraper {
    getWebsite(): Website {
        return {
            website_id: 3,
            name: 'Ryans Computers',
            url: 'https://www.ryans.com',
        };
    }

    readonly categories: CategoryLink[] = [
        { category: 'Laptop', url: 'https://www.ryans.com/category/laptop-all-laptop', },
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
        const lastPageLink = $('ul.pagination > li:nth-last-child(2) > a').attr('href') ?? '';
        const params = new URLSearchParams(lastPageLink.split('?')[1]);
        if (!params.has('page')) {
            logger.warn('No page parameter found in last page link');
            return 1;
        }
        return Number(params.get('page'));
    }

    private parsePageLinks(html: string): string[] {
        const $ = cheerio.load(html);
        const imageCards = $('div.category-single-product div.image-box > a');
        const pageLinks: string[] = [];
        imageCards.each((i, img) => {
            const link = $(img).attr('href') ?? '';
            if (link) {
                pageLinks.push(link);
            }
        });
        return pageLinks;
    }

    async parseProductPage(pageUrl: string): Promise<ScrapedProduct> {
        logger.debug(`Scraping ${pageUrl}`);

        const req = await this.fetchWithThrottle(pageUrl);
        const html = await req.body.text();
        const $ = cheerio.load(html);

        const priceProp = $('div.details-all-block > meta[itemprop=price]').attr('content')?.trim();
        let price: number | null = null;
        if (priceProp && !isNaN(parseInt(priceProp))) {
            price = parseInt(priceProp);
        }

        return {
            name: $('div.info-detail-column > div.product_content > h1').text().trim(),
            price: price,
            isAvailable: true, // Ryans by default show only available products
            url: pageUrl,
            slug: pageUrl.split('/').pop() ?? '',
            manufacturer: $('div[itemprop=brand] > span[itemprop=name]').text().trim(),
            raw_metadata: this.parseSpecifications($),
        };
    }

    private parseSpecifications($: cheerio.Root): Record<string, string> {
        const specifications: Record<string, string> = {};
        $('div.basic-spec-div > div').each((_i, groupDiv) => {
            const specGroup = $(groupDiv).children().first().find('h6').text().trim();
            const specs = $(groupDiv).children().last().find('div[itemprop=description]');
            specs.each((_j, spec) => {
                const key = $(spec).children().first().find('span.att-title').text().trim();
                const value = $(spec).children().last().find('span.att-value').text().trim();
                specifications[this.formatSpecKey(specGroup, key)] = value;
            });
        });
        return specifications;
    }
}
