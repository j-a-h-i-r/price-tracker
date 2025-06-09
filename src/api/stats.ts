import type { FastifyInstance } from 'fastify';
import { ProductService } from '../services/product.service.ts';
import { getWebsiteCount } from '../services/website.service.ts';
import { getCategoryCount } from '../services/category.service.ts';

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
