import logger from '../core/logger.ts';
import type { Task } from './task.ts';

export interface JobProps {
    name: string;
    task: Task;
}

/**
 * Probably should be an interface or abstract class. But having it as concrete class
 * allows easily creating simple jobs that just run a task.
 */
export class Job {
    readonly name: string;
    task: Task;

    constructor(job: JobProps) {
        this.name = job.name;
        this.task = job.task;
    }

    run(): Promise<void> {
        return this.task.run();
    }
}

interface CronJobProps extends JobProps {
    schedule: string;
    successors?: Job[]; // Optional successors for the job
}

export class CronJob extends Job {
    readonly schedule: string;
    readonly successors: Job[] = [];

    constructor(job: CronJobProps) {
        super(job);
        this.schedule = job.schedule;
        if (Array.isArray(job.successors)) {
            this.successors = job.successors;
        }
    }

    override run(): Promise<void> {
        return this.task.run().then(() => {
            logger.info(`Cron job [${this.name}] completed. Checking for successors...`);
            return this.#runSuccessors();
        });
    }

    #runSuccessors(): Promise<void> {
        if (this.successors.length === 0) {
            logger.info(`No successors for job [${this.name}]`);
            return Promise.resolve();
        }

        logger.info(`Running successors for job [${this.name}]: ${this.successors.map(s => s.name).join(', ')}`);
        const successPromises = this.successors.map(successorJob => {
            logger.info(`Running successor job: [${successorJob.name}] of job [${this.name}]`);
            return successorJob.run()
                .then(() => logger.info(`Successor job [${successorJob.name}] executed successfully`))
                .catch((error) => logger.error(error, `Successor job [${successorJob.name}] execution failed`));
        });

        // Always resolve even it the successors fail
        // TODO: Maybe handle this differently in the future
        return Promise.all(successPromises)
            .then(() => Promise.resolve())
            .catch(() => Promise.resolve());
    }
}
