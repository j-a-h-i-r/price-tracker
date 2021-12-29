import { describe, test, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { parseListingPage, parseCardDiv, parsePageCount } from '../parse'

const listingPagePath = path.join(__dirname, '../__mocks__/listing-page.html');
const cardDivPath = path.join(__dirname, '../__mocks__/card-div.html');
const discountCardDivPath = path.join(__dirname, "../__mocks__/card-div-discount.html");

describe('test startech parsing', () => {
    test('page count from listing page', () => {
        const listingFileText = fs.readFileSync(listingPagePath).toString();
        const pageCount = parsePageCount(listingFileText);
        expect(pageCount).toBe(17);
    })
    
    test('listing page parsing', () => {
        const listingFileText = fs.readFileSync(listingPagePath).toString();
        const htmls = parseListingPage(listingFileText)
    
        expect(Array.isArray(htmls)).toBe(true);
        expect(htmls.length).toBe(20);
    })
    
    test('card html parsing', () => {
        const cardDivHtml = fs.readFileSync(cardDivPath).toString();
        const item = parseCardDiv(cardDivHtml);
        expect(item).toStrictEqual({
            name: "Deepcool GH-01 A-RGB Graphics Card Holder",
            price: 1500,
            isAvailable: true,
            url: "https://www.startech.com.bd/deepcool-gh-01-a-rgb-graphics-card-holder",
            slug: "deepcool-gh-01-a-rgb-graphics-card-holder",
        })
    })

    test("parse card html with discount", () => {
        const cardDivHtml = fs.readFileSync(discountCardDivPath).toString();
        const item = parseCardDiv(cardDivHtml);
        expect(item).toStrictEqual({
            name: "Palit GeForce GT 730 2GB DDR3 Graphics Card",
            price: 6300,
            isAvailable: true,
            url: "https://www.startech.com.bd/palit-geforce-gt-730-graphics-card",
            slug: "palit-geforce-gt-730-graphics-card",
        })
    })
})
