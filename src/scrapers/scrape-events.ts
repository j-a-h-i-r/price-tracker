import { EventEmitter } from 'events';
import { ScrapedProduct, ScrapeListener } from './scraper.types';

export class ScrapeConsumer {
    constructor(private emitter: EventEmitter) {}

    onProducts(listener: ScrapeListener): void {
        this.emitter.on('products', (category, products) => {
            setImmediate(() => listener(category, products));
        });
    }

    onComplete(listener: (allProducts: ScrapedProduct[]) => void): void {
        this.emitter.on('complete', (allProducts: ScrapedProduct[]) => {
            setImmediate(() => listener(allProducts));
        });
    }

    onError(listener: (error: Error) => void): void {
        this.emitter.on('error', listener);
    }
}

export class ScrapeProducer {
    private emitter = new EventEmitter();

    getEmitter(): EventEmitter {
        return this.emitter;
    }

    removeListeners(): void {
        this.emitter.removeAllListeners();
    }

    emit(category: string, products: ScrapedProduct[]): void {
        this.emitter.emit('products', category, products);
    }

    emitComplete(products: ScrapedProduct[]): void {
        this.emitter.emit('complete', products);
    }

    emitError(error: Error): void {
        this.emitter.emit('error', error);
    }
}