import axios from 'axios';

function postToPage(pageId: string, accessToken: string, postBody: string) {
    const fbUrl = `https://graph.facebook.com/v19.0/${pageId}/feed`;
    return axios.post(
        fbUrl, {
            'message': postBody,
            'access_token': accessToken
        }
    )
    .then(resp => resp.data);
}

export { postToPage };
