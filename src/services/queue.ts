import logger from '../core/logger.js';

interface QueueOptions {
    batchSize?: number;
    maxWaitMillis?: number;
}

export class Queue {
    private queue: any[];
    private batchSize: number;
    private maxWaitMillis: number;
    private timer: NodeJS.Timeout | null;
    private processor: (items: any[]) => Promise<void>;

    constructor(
        processor: (items: any[]) => Promise<void>,
        options: QueueOptions = {}
    ) {
        this.queue = [];
        this.batchSize = options.batchSize || 100;
        this.maxWaitMillis = options.maxWaitMillis || 10000;
        this.timer = null;
        this.processor = processor;
    }

    add(item: any) {
        logger.debug(`Adding item to queue. Queue size: ${this.queue.length}`);
        this.queue.push(item);

        // If queue is full then trigger processing
        if (this.queue.length >= this.batchSize) {
            // Process in the next tick
            setImmediate(() => this.process());
            return;
        }

        // If queue is not full and timer is not set, set a timer
        if (!this.timer) {
            this.timer = setTimeout(() => this.process, this.maxWaitMillis);
        }
    }

    process() {
        if (this.queue.length === 0) {
            return null;
        }

        // Clear any pending timer
        clearTimeout(this.timer!);
        this.timer = null;

        // Process the batch
        const items = this.queue.splice(0, this.batchSize);
        this.processor(items);

        // If more items left then set a timer to process
        if (this.queue.length > 0) {
            this.timer = setTimeout(() => this.process(), this.maxWaitMillis);
        }
    }

    size() {
        return this.queue.length;
    }
}