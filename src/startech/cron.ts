import { parseEvent } from "../events"
import logger from "../core/logger";
import { parseProducts } from ".";
import { saveGpuPrices, saveGpus } from "./service";
import dayjs from "dayjs";

export async function scrapeAndSaveGpuPrices() {
    try {
        const timeNow = dayjs().format("YYYY/MM/DD HH:mm:ss")
        logger.info("Starting GPU scraping. Time:", timeNow);

        const parsedGpus = await parseProducts();
        console.log(`Scraped ${parsedGpus.length} GPUs`);
    
        const storedGpus = await saveGpus(parsedGpus);
        console.log("Scraped GPUs saved to DB");
    
        const storedGpuPrices = await saveGpuPrices(parsedGpus);
        console.log("GPU prices saved to DB");

        parseEvent.notify();
    } catch (err) {
        logger.error("Failed to parse/store GPUs in DB");
        logger.error(err);
    }
}
