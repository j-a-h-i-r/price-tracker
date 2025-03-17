declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production';
            PORT?: number;
            DATABASE_URL: string;
            MAIL_HOST: string;
            MAIL_USER: string;
            MAIL_PASS: string;
            MAIL_PORT: number;
            MAIL_FROM: string;
            MAIL_TO: string;

            SCRAPE_HOUR_INTERVAL: string;

            ADMIN_TOKEN: string;
            REDIS_HOST: string;
            REDIS_PORT: string;
        }
    }
}

export { };
