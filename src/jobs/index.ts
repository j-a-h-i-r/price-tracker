import { CronJob } from './cronjob.ts';

export class ScrapingJob extends CronJob {
    constructor() {
        super({
            name: 'scraping',
            schedule: '0 1 * * *', // Every day at 1:00 AM
            jobFile: 'src/jobs/scrape.job.ts',
        });
    }
}

export const cronJobs: CronJob[] = [
    new ScrapingJob(),
];
