import { spawn } from 'child_process';
import logger from '../core/logger.ts';

interface JobProps {
    name: string;
    task?: () => Promise<void>;
    jobFile?: string; // Optional job file path
}

export class Job {
    readonly name: string;
    task?: () => Promise<void>;
    jobFile?: string;

    constructor(job: JobProps) {
        this.name = job.name;

        if (job.task && job.jobFile) {
            throw new Error(`Job [${this.name}] cannot have both a task and a job file specified.`);
        }

        if (job.task) {
            this.task = job.task;
        } else {
            this.jobFile = job.jobFile;
        }
    }

    #runJobInProcess() {
        return new Promise<void>((resolve, reject) => {
            if (!this.jobFile) {
                return reject(new Error(`Job ${this.name} does not have a job file specified.`));
            }
            
            logger.info(`Running job ${this.name} from file: ${this.jobFile} in new process`);
            const sub = spawn('node', ['--experimental-strip-types', this.jobFile], {
                // Only need stdout and stderr for logging
                stdio: ['ignore', 'inherit', 'inherit'],
                detached: false,
            });

            logger.info(`Job ${this.name} started with PID: ${sub.pid}`);

            sub.on('close', (code) => {
                logger.info(`Job ${this.name} completed with exit code ${code}`);
                resolve();
            });

            sub.on('error', (error) => {
                logger.error(error, `Error running job ${this.name}:`);
                reject(error);
            });
        });
    }

    run(): Promise<void> {
        if (this.task) {
            return this.task();
        } else if (this.jobFile) {
            return this.#runJobInProcess();
        } else {
            return Promise.reject(new Error(`No task or job file specified for job ${this.name}`));
        }
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
        return super.run().then(() => {
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
