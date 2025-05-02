import emailer from '../core/email.js';
import { TrackedProductResult } from '../types/product.types.js';

export async function sendAuthLinkEmail(email: string, authLink: string, expiryMinutes: number) {
    return emailer.send({
        template: 'auth-link',
        message: {
            to: email,
        },
        locals: {
            authLink,
            expiryMinutes,
        }
    });
}

export async function sendPriceTrackEmail(email: string, products: TrackedProductResult[]) {
    return emailer.send({
        template: 'price-track',
        message: {
            to: email,
        },
        locals: {
            products
        }
    });
}
