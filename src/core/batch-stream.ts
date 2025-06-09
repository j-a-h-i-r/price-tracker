import { Transform, type TransformCallback } from 'stream';

/**
 * Utility stream that creates batches from another stream.
 */
export class BatchTransform extends Transform {
    #batchSize = 0;
    #batch: any[] = [];

    constructor(options = { batchSize: 100 }) {
        super({ objectMode: true });
        this.#batchSize = options.batchSize;
    }

    _flush(callback: TransformCallback) {
        this.#push();
        callback();
    }

    _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback): void {
        this.#batch.push(chunk);
        if (this.#batch.length >= this.#batchSize) {
            this.#push();
        }
        callback();
    }

    #push() {
        if (this.#batch.length === 0) return;
        this.push(this.#batch);
        this.#batch = [];
    }
}
