import * as cheerio from 'cheerio';
import { GpuWithPrice } from '../types';

function parsePageCount(listingHtml: string): number {
    const $ = cheerio.load(listingHtml);
    const paginationText = $("div[class='bottom-bar']").find(".text-right").text().trim();
    const match = /\((?<pageNumber>\d+)[^)]+\)/.exec(paginationText);
    const pageCount = Number(match?.groups?.pageNumber);
    return pageCount;
}

function parseListingPage(html: string): string[] {
    const $ = cheerio.load(html);
    const cardDivs = $("div[class='p-item']");
    const divs: string[] = [];
    cardDivs.each((i, div) => {
        const html = $.html(div).toString();
        divs.push(html);
    });
    return divs;
}

function parseCardDiv(cardHtml: string): GpuWithPrice {
    const $ = cheerio.load(cardHtml);

    const itemName = $("h4[class='p-item-name']").text().trim();
    const itemPriceRaw = $("div[class='p-item-price']").text().trim();
    const itemPrice = Number(itemPriceRaw.replace(/[^\d.]+/gm, ""));
    const buyBtnText = $("span[class='st-btn btn-add-cart']").contents().last().text().trim();
    const itemAvailabilityStatus = buyBtnText === "Buy Now";
    const itemLink = $("h4[class='p-item-name'] > a").attr("href") ?? "";
    const slug = itemLink.split("/").pop() ?? "";

    return {
        name: itemName,
        price: itemPrice,
        isAvailable: itemAvailabilityStatus,
        url: itemLink,
        slug: slug,
    }
}

export {
    parsePageCount,
    parseListingPage,
    parseCardDiv,
}