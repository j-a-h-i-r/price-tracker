import { pipeline, Readable, Transform } from 'stream';
import { scrapers } from './index.js';
import mergeStreams from '@sindresorhus/merge-streams';
import { BatchTransform } from '../core/batch-stream.js';
import logger from '../core/logger.js';

/**
 * Creates a stream of products from all scrapers.
 * Reading from this stream will produce scraped products.
 */
export function createProductStream(): Readable {
    const streams = scrapers.map(({ scraper }) => {
        return Readable.from(scraper.scrapeProducts());
    });

    return mergeStreams(streams);
}

function pipelineCallback(err: NodeJS.ErrnoException | null) {
    if (err) {
        logger.error(err, 'Batched product pipeline error');
    } else {
        logger.info('Batches product pipeline completed successfully');
    }
}

export function createBatchedProductStream(batchSize: number = 100): Transform {
    const productStream = createProductStream();
    const batchedTransformer = new BatchTransform({
        batchSize: batchSize,
    });
    return pipeline(
        productStream,
        batchedTransformer,
        pipelineCallback,
    );
}
