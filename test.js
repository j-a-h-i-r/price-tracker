import mergeStreams from '@sindresorhus/merge-streams';
import { Readable, pipeline, Transform, Writable } from 'stream';

async function* generateData(source) {
    for (let j = 0; j < 10; j++) {
        // console.log('Generating data:', i);
        yield `${source} - ${j}`;
    }
}

const SourceStream1 = Readable.from(generateData('Input1'), {
    objectMode: true,
});
const SourceStream2 = Readable.from(generateData('Input2'), {
    objectMode: true,
});

class BatchTransform extends Transform {
    #batchSize = 0;
    #batch = [];
  
    constructor(options = { batchSize: 10 }) {
      super({ objectMode: true });
      this.#batchSize = options.batchSize;
    }
  
    _flush(callback) {
      this.#push();
      callback();
    }
  
    _transform(chunk, encoding, callback) {
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


const WritableStream = new Writable({
    objectMode: true,
    highWaterMark: 3,
    final(callback) {
        console.log('Finalizing batch processing');
        callback();
    },
    write(chunks, encoding, callback) {
        setTimeout(() => {
            // Simulate async processing
            // console.log(`Processing batch of ${chunks.length} chunks:`);
            console.log(chunks);
            callback();
        }, 1000);
    },
});

function callback(err) {
    if (err) {
        console.error('Pipeline error:', err);
    } else {
        console.log('Pipeline completed successfully');
    }
}

let batchPipeline = pipeline(
  mergeStreams([SourceStream1, SourceStream2]),
  new BatchTransform({batchSize: 3}),
  callback,
);
pipeline(batchPipeline, WritableStream, callback);

// pipeline(mergeStreams([SourceStream1, SourceStream2]), new BatchTransform({batchSize: 3}), WritableStream, callback);
