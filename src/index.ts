import { setupTasks } from "./cron";
import { scrapeAndSaveGpuPrices } from "./startech/cron";
import { setupServer } from "./server";

if (require.main === module) {
    // setupTasks();
    scrapeAndSaveGpuPrices();

    setupServer()
    .then(() => {
        console.log("Server running")
    })
    .catch(() => {
        console.error("Failed to run server");
    })
}
