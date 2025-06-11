import cron, { type ScheduledTask } from 'node-cron';
import logger from '../core/logger.ts';
import type { CronJob } from './cronjob.ts';

export class JobManager {
    private jobs: Map<string, CronJob>;
    private tasks: Map<string, ScheduledTask>;
    private states: Map<string, 'running' | 'completed' | 'failed'>;

    constructor(jobs: CronJob[] = []) {
        this.jobs = new Map();
        this.tasks = new Map();
        this.states = new Map();
        jobs.forEach(job => this.addJob(job));
        this.bakeJobs();
    }

    scheduleJobs() {
        this.tasks.entries().forEach(([jobName, task]) => {
            task.start();
            logger.info(`Job ${jobName} scheduled`);
        });
    }

    private bakeJobs() {
        this.jobs.values().forEach((job) => {
            logger.info(`Scheduling job: ${job.name} with schedule: ${job.schedule}`);
            const task = cron.schedule(job.schedule, () => {
                const jobState = this.states.get(job.name);
                if (jobState === 'running') {
                    logger.warn(`Job ${job.name} is already running, skipping this execution.`);
                    return;
                }
                this.states.set(job.name, 'running');

                logger.info(`Running job: [${job.name}]`);
                job.run()
                    .then(() => {
                        this.states.set(job.name, 'completed');
                        logger.info(`Job [${job.name}] executed successfully`);
                    })
                    .catch((error) => {
                        this.states.set(job.name, 'failed');
                        logger.error(error, `Job [${job.name}] execution failed`);
                    });
            }, {
                scheduled: false,
            });
            this.tasks.set(job.name, task);
        });
    }

    addJob(job: CronJob): void {
        if (this.jobs.has(job.name)) {
            throw new Error(`Job with name ${job.name} already exists.`);
        }
        this.jobs.set(job.name, job);
    }

    getJob(name: string): CronJob | undefined {
        return this.jobs.get(name);
    }

    runJob(name: string): Promise<void> {
        const job = this.getJob(name);
        if (!job) {
            return Promise.reject(new Error(`Job with name ${name} not found.`));
        }
        return job.run();
    }

    listJobs(): CronJob[] {
        return Array.from(this.jobs.values());
    }
}
