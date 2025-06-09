import emailer from '../core/email.ts';
import { type TrackedProductResult } from '../types/product.types.ts';

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
