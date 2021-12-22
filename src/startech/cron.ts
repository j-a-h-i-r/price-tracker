import { getLatestGpuChanges, getGpuEmailSubscribers } from "./service";
import { parseEvent } from "../events"
import emailer from "../core/email";
import logger from "../core/logger";

export async function scrapeAndSaveGpuPrices() {
    try {
        // const parsedGpus = await parseProducts();
        // console.log(`Scraped ${parsedGpus.length} GPUs`);
    
        // const storedGpus = await saveGpus(parsedGpus);
        // console.log("Scraped GPUs saved to DB");
    
        // const storedGpuPrices = await saveGpuPrices(parsedGpus);
        // console.log("GPU prices saved to DB");
        parseEvent.notify();
    } catch (err) {
        logger.error("Failed to parse/store GPUs in DB");
        logger.error(err);
    }
}

export async function sendEmailOnGpuPriceAvailablityChange() {
    try {
        const gpuChanges = await getLatestGpuChanges();
        const gpuIds = gpuChanges.map((gpu) => gpu.gpuid);

        const recipients = await getGpuEmailSubscribers(gpuIds);

        recipients.forEach((recipient) => {
            const { gpuid } = recipient;
            
            const gpu = gpuChanges.find((g) => g.gpuid === gpuid);
            if (!gpu) return;

            const { hasAvailabilityChanged, hasPriceChanged, lastPrice, isAvailable } = gpu;
            const { email, url, name } = recipient;

            emailer.send({
                template: "gpu-update",
                message: {
                    to: email,
                },
                locals: {
                    name,
                    url,
                    lastPrice,
                    hasAvailabilityChanged,
                    hasPriceChanged,
                    isAvailable
                }
            })
            .then((x) => logger.info(x))
            .catch((e) => logger.error(e))

        })

        return true;
    } catch (err) {

    }
}
