import { GpuWithPrice } from '../types';
import { parseCardDiv, parseListingPage, parsePageCount } from './parse';
import { fetchAllListingHtml, fetchListingPageHtml } from './scrape';

async function parseProducts(): Promise<GpuWithPrice[]> {
    const oneListingPage = await fetchListingPageHtml(1);
    const numPages = parsePageCount(oneListingPage);
    const gpuListingPages = await fetchAllListingHtml(numPages);

    const products: GpuWithPrice[] = [];
    gpuListingPages.forEach((listingPage) => {
        const productDivs = parseListingPage(listingPage);
        productDivs.forEach((productDiv) => {
            const gpu = parseCardDiv(productDiv);
            products.push(gpu);
        });
    });
    return products;
}

export {
    parseCardDiv,
    parseListingPage,
    parsePageCount,
    fetchAllListingHtml,
    fetchListingPageHtml,
    parseProducts,
};
