import 'dotenv/config'; // Load environment variables from .env file
import { setupServer } from './server.ts';
import logger from './core/logger.ts';
import config from './core/config.ts';
import { setupEverything } from './setup.ts';
// import { ScrapingJob } from './jobs/scrape.job.ts';

try {
    const { jobManager, otlpSdk } = await setupEverything();
    if (config.isProduction) {
        // Only need to schedule in production
        jobManager.scheduleJobs();
    }

    if (!config.isProduction) {
        // Development specific setup
        // jobManager.scheduleJobs();
        // new ScrapingJob().run();
    }
    
    otlpSdk.start();
    logger.info('Setup completed');
} catch (error) {
    logger.error(error, 'Failed to setup everything');
}

try {
    await setupServer();
    logger.info('Server running');
} catch (error) {
    logger.error(error, 'Failed to run server');
}
