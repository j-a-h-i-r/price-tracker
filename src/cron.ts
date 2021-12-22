import cron from "node-cron";
import { scrapeAndSaveGpuPrices } from "./startech/cron";
import logger from "./core/logger";

/**
 * Run it every six hours
 */
const task = cron.schedule("0 */6 * * *", () => {
    logger.info("Running cron for scraping and saving GPU prices");
    
    scrapeAndSaveGpuPrices()
    .then(() => {
        logger.info("Successfully scraped and saved GPU prices");
    })
    .catch(() => {
        logger.error("Error while scraping and saving GPU prices");
    })
})

export function setupTasks() {
    task.start();
}
