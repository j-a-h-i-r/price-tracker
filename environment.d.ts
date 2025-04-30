declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production';
            PORT?: string;
            DATABASE_URL: string;
            MAIL_HOST: string;
            MAIL_USER: string;
            MAIL_PASS: string;
            MAIL_PORT: string;
            MAIL_FROM: string;
            MAIL_TO: string;

            SCRAPE_HOUR_INTERVAL: string;

            ADMIN_TOKEN: string;

            SIGNOZ_ENDPOINT: string;
            JWT_SECRET: string;
            BASE_URL: string;
        }
    }
}

export { };
