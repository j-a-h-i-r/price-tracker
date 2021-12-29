import cron from "node-cron";
import { scrapeAndSaveGpuPrices } from "./startech/cron";
import logger from "./core/logger";
import config from "./core/config";

const cronScheduleString = `0 */${config.scrapeHourInterval} * * *`;
logger.debug("Cron Schedule %s", cronScheduleString);

const task = cron.schedule(cronScheduleString, () => {
    logger.info("Setting up cron tasks");
    
    scrapeAndSaveGpuPrices()
    .then(() => {
        logger.info("Cron task ran successfully!");
    })
    .catch(() => {
        logger.error("Error while running a cron task!");
    })
}, {
    scheduled: false,
})

export function setupTasks() {
    task.start();
}
