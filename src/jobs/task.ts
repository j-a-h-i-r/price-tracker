import { spawn } from 'child_process';
import logger from '../core/logger.ts';

export interface Task {
    run(): Promise<void>;
}

/**
 * Simple tasks that executes an async function.
 */
export class AsyncTask implements Task {
    task: () => Promise<void>;
    constructor(task: () => Promise<void>) {
        this.task = task;
    }
    run(): Promise<void> {
        return this.task();
    }
}

/**
 * Task that runs a job file in a new process.
 * @param jobFile - The path to the job file to run.
 */
export class SanboxedTask implements Task {
    jobFile: string;
    constructor(jobFile: string) {
        this.jobFile = jobFile;
    }

    run(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            logger.info(`Running file: ${this.jobFile} in new process`);
            const sub = spawn('node', ['--experimental-strip-types', this.jobFile], {
                // Only need stdout and stderr for logging
                stdio: ['ignore', 'inherit', 'inherit'],
                detached: false,
            });
            logger.info(`Job started with PID: ${sub.pid}`);

            sub.on('close', (code) => {
                logger.info(`Job completed with exit code ${code}`);
                resolve();
            });

            sub.on('error', (error) => {
                logger.error(error, 'Error running job');
                reject(error);
            });
        });
    }
}
