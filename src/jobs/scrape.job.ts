import logger from '../core/logger.ts';
import { sendEmailForTrackedProducts } from '../services/pricetrack.service.ts';
import { CronJob, Job } from './cronjob.ts';

async function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const priceUpdateEmailJob = new Job({
    name: 'priceUpdateEmail',
    task: async () => {
        await wait(60 * 1000); // Wait for 60 seconds
        logger.info('Sending price update emails for tracked products');
        return sendEmailForTrackedProducts();
    }
});

export class ScrapingJob extends CronJob {
    constructor() {
        super({
            name: 'scraping',
            schedule: '0 1 * * *', // Every day at 1:00 AM
            jobFile: 'src/jobs/sandboxed/scrape.sandboxed.ts',
            successors: [priceUpdateEmailJob],
        });
    }
}
