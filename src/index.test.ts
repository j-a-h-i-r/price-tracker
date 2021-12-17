import { describe, test, expect } from '@jest/globals';

import * as fs from 'fs'
import { parseListing, parseCardDiv } from './index'


test('listing page parsing', () => {
    const listingFileText = fs.readFileSync('./test/listing-page.html').toString();
    const htmls = parseListing(listingFileText)

    expect(Array.isArray(htmls)).toBe(true);
    expect(htmls.length).toBe(20);
})

test('card html parsing', () => {
    const cardDivHtml = fs.readFileSync('./test/card-div.html').toString();
    const item = parseCardDiv(cardDivHtml);
    expect(item).toStrictEqual({
        name: "Deepcool GH-01 A-RGB Graphics Card Holder",
        price: 1500,
        isAvailable: true,
        link: "https://www.startech.com.bd/deepcool-gh-01-a-rgb-graphics-card-holder",
    })
})