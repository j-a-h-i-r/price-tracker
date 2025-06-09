import { CronJob } from './cronjob.ts';
import { ScrapingJob } from './scrape.job.ts';

export const cronJobs: CronJob[] = [
    new ScrapingJob(),
];
