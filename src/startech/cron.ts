import Email from "email-templates";
import { parseProducts } from "./index";
import { saveGpuPrices, saveGpus, getLatestGpuChanges, getGpuEmailSubscribers } from "./service";
import config from "../core/config";

const emailer = new Email({
    message: {
        from: config.mail.from,
    },
    send: true,
    transport: {
        host: config.mail.host,
        port: config.mail.port,
            auth: {
                user: config.mail.auth.user,
                pass: config.mail.auth.pass,
            }
    }
})

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
            .then((x) => console.log(x))
            .catch((e) => console.error(e))

        })

        return true;
    } catch (err) {

    }
}
