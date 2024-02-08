import emailer from "../core/email";
import logger from "../core/logger";
import { parseEvent } from "../events";
import type { GpuPriceChange } from "../types";
import { getGpuEmailSubscribers, getLatestGpuChanges } from "./service";
import config from "../core/config";
import { postToPage } from "../core/fb";

export async function sendEmailOnGpuPriceAvailablityChange() {
    try {
        logger.info("Preparing to send email on GPU price/availability changes!");

        const gpuChanges = await getLatestGpuChanges();
        logger.debug({ gpuChanges }, "GPU changes");

        const gpuIds = gpuChanges.map((gpu) => gpu.gpuid);
        logger.info({ gpuIds }, "GpuIds with changes");

        const recipients = await getGpuEmailSubscribers(gpuIds);
        logger.info({ recipients }, "Email recipients");

        recipients.forEach((recipient) => {
            const { gpuid } = recipient;

            const gpu = gpuChanges.find((g) => g.gpuid === gpuid);
            if (!gpu) return;

            const { hasAvailabilityChanged, hasPriceChanged, lastPrice, isAvailable, name, url } = gpu;
            const { email } = recipient;

            const locals = {
                name,
                url,
                lastPrice,
                hasAvailabilityChanged,
                hasPriceChanged,
                isAvailable
            }

            sendGpuUpdateEmail(email, locals);
        })

        await sendPriceChangeSummaryEmail(gpuChanges);

        return true;
    } catch (err) {
        logger.error("Error while sending emails on GPU price/availability changes");
        logger.error(err);
        return false;
    }
}

async function sendGpuUpdateEmail(email: string, values: any) {
    return emailer.send({
        template: "gpu-update",
        message: {
            to: email,
        },
        locals: {
            ...values,
        }
    })
    .then((x) => {
        logger.info(`Email sent to (${email})`);
        return true;
    })
    .catch((e) => {
        logger.error(`Failed to send email to (${email})`);
        logger.error(e);
        return false;
    })
}

async function sendPriceChangeSummaryEmail(changes: GpuPriceChange[]) {
    if (changes.length === 0) return true;

    const formatted = changes.map((change) => {
        const { name, lastPrice, previousPrice, hasAvailabilityChanged, hasPriceChanged, isAvailable, url } = change;
        
        let whatChanged = "";
        if (hasAvailabilityChanged && hasPriceChanged) whatChanged = "Price and Availability";
        else if (hasAvailabilityChanged) whatChanged = "Price";
        else if (hasPriceChanged) whatChanged = "Availability";

        const priceChange = lastPrice - previousPrice;
        const priceIncreased = priceChange > 0;
        let priceText = "";
        if (priceIncreased) {
            priceText = `${lastPrice} (${priceChange} increased)`;
        } else {
            priceText = `${lastPrice} (${priceChange} decreased)`;
        }

        const status = isAvailable? "Available": "Not Available";

        return {
            name,
            url,
            priceIncreased,
            priceText,
            whatChanged,
            status, 
        }
    })

    try {
        await emailer.send({
            template: "price-change-summary",
            message: {
                to: config.mail.to ?? "summary@example.com",
            },
            locals: {
                changes: formatted,
            }
        })
        return true;
    } catch (err) {
        logger.error(err);
        return false;
    }
}

export async function postToFacebook() {
    const fbToken = config.fbToken;
    const pageId = config.fbPageId;

    const gpuChanges = await getLatestGpuChanges();

    if (gpuChanges.length === 0) return;

    const lines = gpuChanges.map((gpu) => {
        const priceDiff = gpu.lastPrice - gpu.previousPrice;
        const priceDiffSign = priceDiff >= 0? "+" : "";
        return `${gpu.name} - ${gpu.lastPrice}(${priceDiffSign}${priceDiff})`
    })

    const gpuPriceText = lines.join("\n");

    const post = `GPU Price Update\n\n`
        + `${gpuPriceText}`;

    logger.debug(post, "Message to be posted to FB page");

    postToPage(pageId, fbToken, post)
        .then((resp) => {
            logger.info("Posted update to FB");
            logger.info(resp);
        })
        .catch((err) => {
            logger.error(err, "Error while posting update to FB");
        })
}

export function setupEventHandlers() {
    parseEvent.subscribe(sendEmailOnGpuPriceAvailablityChange);
    parseEvent.subscribe(postToFacebook)
}

