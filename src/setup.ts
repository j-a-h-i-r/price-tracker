import logger from './core/logger.ts';
import { sdk } from './otlp.ts';
import { cronJobs } from './jobs/index.ts';
import { JobManager } from './jobs/jobmanager.ts';

/**
 * Set up the queeue, worker and cron job
 * @returns 
 */
export async function setupEverything() {
    logger.info('Setting up stuff');

    const jobManager = new JobManager(cronJobs);

    return { jobManager, otlpSdk: sdk };
}
