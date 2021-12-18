import { setupTasks } from "./cron";
import { scrapeAndSaveGpuPrices } from "./startech/cron";

if (require.main === module) {
    // setupTasks();
    scrapeAndSaveGpuPrices();
}
