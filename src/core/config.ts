const NODE_ENV = process.env.NODE_ENV;
const isProduction = NODE_ENV === "production";

const config = {
    databaseUrl: process.env.DATABASE_URL,
    isProduction: isProduction,
    scrapeHourInterval: Number(process.env.SCRAPE_HOUR_INTERVAL) ?? 2,
    mail: {
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        from: process.env.MAIL_FROM,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    }
}

export default config;
