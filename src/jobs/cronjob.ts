import { spawn } from 'child_process';
import logger from '../core/logger.ts';

interface CronJobProps {
    name: string;
    schedule: string;
    task?: () => Promise<void>;
    jobFile?: string; // Optional job file path
}

export class CronJob implements CronJobProps {
    readonly name: string;
    readonly schedule: string;
    task?: () => Promise<void>;
    jobFile?: string;

    constructor(job: CronJobProps) {
        this.name = job.name;
        this.schedule = job.schedule;
        this.task = job.task;
        this.jobFile = job.jobFile;
    }

    #runJobInProcess() {
        return new Promise<void>((resolve, reject) => {
            if (!this.jobFile) {
                logger.error(`Job ${this.name} does not have a job file specified.`);
                return reject(new Error(`Job ${this.name} does not have a job file specified.`));
            }
            logger.info(`Running job ${this.name} from file: ${this.jobFile} in new process`);
            
            const sub = spawn('node', ['--experimental-strip-types', this.jobFile], {
                stdio: 'inherit',
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
            logger.error(`No task or job file specified for job ${this.name}`);
            return Promise.reject(new Error(`No task or job file specified for job ${this.name}`));
        }
    }

}