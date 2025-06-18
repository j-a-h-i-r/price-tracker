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
        { category: 'Laptop', url: 'https://www.pickaboo.com/product/laptop-notebook', },
        { category: 'Tablet', url: 'https://www.pickaboo.com/product/tablet', },
        { category: 'Monitor', url: 'https://www.pickaboo.com/product/monitor', },
        { category: 'Air Conditioner', url: 'https://www.pickaboo.com/product/air-conditioner' },
        { category: 'Gaming Console', url: 'https://www.pickaboo.com/product/gaming-console?cat=155' },
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


    async fetchListingPageHtml(url: string, pageNumber: number): Promise<string> {
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

    async fetchProductPageHtml(pageUrl: string): Promise<string> {
        const req = await this.fetchWithThrottle(pageUrl);
        return req.body.text();
    }

    async parseProductPage(pageUrl: string): Promise<ScrapedProduct> {
        logger.debug(`Scraping ${pageUrl}`);
        const html = await this.fetchProductPageHtml(pageUrl);
        const $ = cheerio.load(html);

        const jsonPropText = $('script[id=__NEXT_DATA__]').text().trim();
        const jsonProp = JSON.parse(jsonPropText);
        const productData = jsonProp.props.pageProps;

        const regularPrice = productData?.productPrice;
        const specialPrice = productData?.productSpecialPrice;
        const price = specialPrice ? specialPrice : regularPrice;

        const productName = productData?.product?.name ?? $('h1.title').text().trim();
        const brand = productData?.product?.brand ?? $('div.brand-view > p > div > span').text().trim();

        const metadataList = productData?.productMoreInformation ?? [];
        const specifications: Record<string, string> = {};
        metadataList.forEach((item: { group_label: string; attr_list: { label: string; value: string }[] }) => {
            const { group_label, attr_list } = item;
            attr_list.forEach(attr => {
                const key = this.formatSpecKey(group_label, attr.label);
                specifications[key] = attr.value;
            });
        });

        return {
            name: productName,
            price: price,
            isAvailable: true,
            url: pageUrl,
            slug: pageUrl.split('/').pop() ?? '',
            manufacturer: brand,
            raw_metadata: specifications,
        };
    }
}
