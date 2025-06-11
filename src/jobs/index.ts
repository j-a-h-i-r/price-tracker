import { CronJob } from './job.ts';
import { ScrapingJob } from './scrape.job.ts';

export const cronJobs: CronJob[] = [
    new ScrapingJob(),
];
