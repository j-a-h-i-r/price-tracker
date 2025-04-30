import { Secret } from 'jsonwebtoken';

const NODE_ENV = process.env.NODE_ENV;
const isProduction = NODE_ENV === 'production';

const config = {
    databaseUrl: process.env.DATABASE_URL,
    isProduction: isProduction,
    scrapeHourInterval: Number(process.env.SCRAPE_HOUR_INTERVAL) || 2,
    mail: {
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        from: process.env.MAIL_FROM,
        to: process.env.MAIL_TO,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    },
    fbToken: process.env.FB_TOKEN ?? '',
    fbPageId: process.env.FB_PAGE_ID ?? '',
    adminToken: process.env.ADMIN_TOKEN,
    signozEndpoint: process.env.SIGNOZ_ENDPOINT ?? 'http://localhost:4318',
    jwtSecret: process.env.JWT_SECRET as Secret,
    baseUrl: process.env.BASE_URL,
};

export default config;
