import emailer from "../core/email";
import logger from "../core/logger";
import { parseEvent } from "../events";
import { getGpuEmailSubscribers, getLatestGpuChanges } from "./service";

export async function sendEmailOnGpuPriceAvailablityChange() {
    try {
        logger.info("Preparing to send email on GPU price/availability changes!");

        const gpuChanges = await getLatestGpuChanges();
        const gpuIds = gpuChanges.map((gpu) => gpu.gpuid);
        logger.info({gpuIds}, "GpuIds with changes");

        const recipients = await getGpuEmailSubscribers(gpuIds);
        logger.info({recipients}, "Email recipients");

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
                .then((x) => logger.info(`Email sent to ${email}`))
                .catch((e) => logger.error(e))
        })

        return true;
    } catch (err) {

    }
}

export function setupEventHandlers() {
    parseEvent.subscribe(sendEmailOnGpuPriceAvailablityChange);
}

