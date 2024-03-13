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

        // Don't want to email on GPUs that are not available
        const availableGpus = gpuChanges.filter((gpu) => gpu.lastPrice > 0);

        const gpuIds = availableGpus.map((gpu) => gpu.gpuid);
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
    const availableGpus = gpuChanges.filter((gpu) => gpu.lastPrice > 0);

    if (availableGpus.length === 0) {
        logger.debug("No GPU changes to post. Ignoring.");
        return;
    }

    const post = prepareFormattedMessageForPostingToFacebook(availableGpus);

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

export function prepareFormattedMessageForPostingToFacebook(gpuList: GpuPriceChange[]) {
    const lines = gpuList.map((gpu) => {
        const priceDiff = gpu.lastPrice - gpu.previousPrice;
        const priceDiffSign = priceDiff >= 0? "📈" : "📉";
        const absolutePriceDiff = Math.abs(gpu.priceDiff);
        return `${gpu.name}\n`
            + `New Price: ${gpu.lastPrice} (${absolutePriceDiff} ${priceDiffSign})\n`
            + `Link: ${gpu.url}\n`
    })

    const gpuPriceText = lines.join("\n");

    const postBody = `GPU Price Update\n\n`
        + `${gpuPriceText}`;

    return postBody;
}

export function setupEventHandlers() {
    parseEvent.subscribe(sendEmailOnGpuPriceAvailablityChange);
    parseEvent.subscribe(postToFacebook)
}

