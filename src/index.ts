import * as cheerio from 'cheerio'

function parseListing(html: string) {
    const $ = cheerio.load(html);
    const cardDivs = $("div[class='p-item']")
    const cardDivHtml = cardDivs.map((i, div) => $.html(div)).toArray();
    return cardDivHtml;
}

function parseCardDiv(cardHtml: string) {
    const $ = cheerio.load(cardHtml);

    const itemName = $("h4[class='p-item-name']").text().trim();
    const itemPriceRaw = $("div[class='p-item-price']").text().trim();
    const itemPrice = Number(itemPriceRaw.replace(/[^\d.]+/gm, ""));
    const buyBtnText = $("span[class='st-btn btn-add-cart']").contents().last().text().trim();
    const itemAvailabilityStatus = buyBtnText === "Buy Now";
    const itemLink = $("h4[class='p-item-name'] > a").attr("href");

    return {
        name: itemName,
        price: itemPrice,
        isAvailable: itemAvailabilityStatus,
        link: itemLink,
    }
}

export {
    parseListing,
    parseCardDiv,
}