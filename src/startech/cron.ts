import { parseProducts } from "./index";
import { saveGpuPrices, saveGpus } from "./service";

export async function scrapeAndSaveGpuPrices() {
    try {
        const parsedGpus = await parseProducts();
        console.log(`Scraped ${parsedGpus.length} GPUs`);
    
        const storedGpus = await saveGpus(parsedGpus);
        console.log("Scraped GPUs saved to DB");
    
        const storedGpuPrices = await saveGpuPrices(parsedGpus);
        console.log("GPU prices saved to DB");
    } catch (err) {
        console.error("Failed to parse/store GPUs in DB");
        console.error(err);
    }
}
