import { pipeline, Readable, Transform } from 'stream';
import { scrapers } from './index.ts';
import mergeStreams from '@sindresorhus/merge-streams';
import { BatchTransform } from '../core/batch-stream.ts';
import logger from '../core/logger.ts';
import { type ProductJob } from '../types/product.types.ts';
import { DedupeStream } from '../core/dedupestream.ts';

/**
 * Creates a stream of products from all scrapers.
 * Reading from this stream will produce scraped products.
 */
function createProductStream(): Readable {
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
    // Seen errors due to multiple items with the same URL. So adding 
    // deduplication stream to remove duplicates.
    const dedupeStream = new DedupeStream((item: ProductJob) => item.url);
    return pipeline(
        productStream,
        batchedTransformer,
        dedupeStream,
        pipelineCallback,
    );
}
