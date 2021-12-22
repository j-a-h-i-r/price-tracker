import { setupTasks } from "./cron";
import { scrapeAndSaveGpuPrices } from "./startech/cron";
import { setupServer } from "./server";
import logger from "./core/logger"

if (require.main === module) {
    // setupTasks();
    scrapeAndSaveGpuPrices();

    setupServer()
    .then(() => {
        logger.info("Server running")
    })
    .catch(() => {
        logger.error("Failed to run server");
    })
}
