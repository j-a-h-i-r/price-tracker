import logger from '../core/logger.ts';
import { sendEmailForTrackedProducts } from '../services/pricetrack.service.ts';
import { CronJob, Job } from './job.ts';
import { AsyncTask, SanboxedTask } from './task.ts';

async function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const priceUpdateEmailJob = new Job({
    name: 'priceUpdateEmail',
    task: new AsyncTask(async () => {
        await wait(60 * 1000); // Wait for 60 seconds
        logger.info('Sending price update emails for tracked products');
        return sendEmailForTrackedProducts();
    }),
});

export class ScrapingJob extends CronJob {
    constructor() {
        super({
            name: 'scraping',
            schedule: '0 0 * * *', // Every day at 12:00 AM
            task: new SanboxedTask('src/jobs/sandboxed/scrape.sandboxed.ts'),
            successors: [priceUpdateEmailJob],
        });
    }
}
