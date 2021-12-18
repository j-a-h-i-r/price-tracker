import cron from "node-cron";
import { scrapeAndSaveGpuPrices } from "./startech/cron";

/**
 * Run it every six hours
 */
const task = cron.schedule("0 */6 * * *", () => {
    console.log("Running cron for scraping and saving GPU prices");
    scrapeAndSaveGpuPrices()
    .then(() => {
        console.log("Successfully scraped and saved GPU prices");
    })
    .catch(() => {
        console.error("Error while scraping and saving GPU prices");
    })
})

export function setupTasks() {
    task.start();
}
