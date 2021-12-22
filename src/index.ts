import { setupTasks } from "./cron";
import { scrapeAndSaveGpuPrices } from "./startech/cron";
import { setupServer } from "./server";
import logger from "./core/logger";
import { setupEventHandlers } from "./startech/events";
import config from "./core/config";

if (require.main === module) {
    if (config.isProduction) {
        setupEventHandlers();
        setupTasks();
    }
    // scrapeAndSaveGpuPrices();

    setupServer()
    .then(() => {
        logger.info("Server running")
    })
    .catch(() => {
        logger.error("Failed to run server");
    })
}
