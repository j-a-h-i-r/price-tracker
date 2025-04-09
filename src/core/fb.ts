import { request } from "undici";

function postToPage(pageId: string, accessToken: string, postBody: string) {
    const fbUrl = `https://graph.facebook.com/v19.0/${pageId}/feed`;
    return request(
        fbUrl, {
            method: 'POST',
            body: JSON.stringify({
                'message': postBody,
                'access_token': accessToken,
            }),
        }
    )
    .then(resp => resp.body.json());
}

export { postToPage };
