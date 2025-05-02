import logger from '../core/logger.js';
import { sendPriceTrackEmail } from './email.service.js';
import { ProductService } from './product.service.js';

export async function sendEmailForTrackedProducts() {
    const eligibleProducts = await new ProductService().getTrackedProductsBelowTargetPrice();
    if (eligibleProducts.length === 0) {
        logger.info('No tracked products below target price');
        return;
    }

    const emailRequest = eligibleProducts.map(async (user) => {
        const { email, products } = user;
        return sendPriceTrackEmail(email, products);
    });

    await Promise.all(emailRequest);
    logger.info('Price track emails sent successfully');
}