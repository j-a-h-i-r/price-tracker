import { FastifyInstance } from 'fastify';
import { ProductService } from '../services/product.service.js';
import { getWebsiteCount } from '../services/website.service.js';
import { getCategoryCount } from '../services/category.service.js';

export default async function statsRoutes(fastify: FastifyInstance) {
    fastify.get('/', async () => {
        const [productCount, websiteCount, categoryCount] = await Promise.all([
            new ProductService().getInternalProductCount(),
            getWebsiteCount(),
            getCategoryCount(),
        ]);

        return {
            products: productCount,
            websites: websiteCount,
            categories: categoryCount,
        };
    });
}
