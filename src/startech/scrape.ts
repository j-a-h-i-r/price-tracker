import { request } from 'undici';

async function fetchListingPageHtml(pageNumber: number): Promise<string> {
    const pageUrl = `https://www.startech.com.bd/component/graphics-card?page=${pageNumber}`;
    const req = await request(pageUrl);
    return req.body.text();
}

async function fetchAllListingHtml(numPages: number) {
    const reqs = [];
    for (let i=1; i<=numPages; i++) {
        reqs.push(fetchListingPageHtml(i));
    }

    const resps = await Promise.allSettled(reqs);
    const htmls = resps.map((resp) => {
        if (resp.status === 'fulfilled') return resp.value;
        return '';
    });
    const validHtmls = htmls.filter((html) => html.length > 0);
    return validHtmls;
}

export {
    fetchAllListingHtml,
    fetchListingPageHtml,
};