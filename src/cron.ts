import cron from "node-cron";
import { scrapeAndSaveGpuPrices } from "./startech/cron";
import logger from "./core/logger";
import config from "./core/config";

const cronScheduleString = `0 */${config.scrapeHourInterval} * * *`;
logger.info("Cron Schedule %s", cronScheduleString);

const task = cron.schedule(cronScheduleString, () => {
    logger.info("Running cron for scraping and saving GPU prices");
    
    scrapeAndSaveGpuPrices()
    .then(() => {
        logger.info("Successfully scraped and saved GPU prices");
    })
    .catch(() => {
        logger.error("Error while scraping and saving GPU prices");
    })
}, {
    scheduled: false,
})

export function setupTasks() {
    task.start();
}
