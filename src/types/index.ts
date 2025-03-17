import type * as dbTypes from './db';

export interface Gpu {
    id?: number
    name: string
    slug: string
    url: string
}

export interface GpuWithPrice extends Gpu {
    price: number
    isAvailable: boolean
}

export type ExceptId<T> = Omit<T, 'id'>;

export interface GpuPriceChange {
    gpuid: number
    name: string
    url: string
    isAvailable: boolean
    lastPrice: number
    previousPrice: number
    hasPriceChanged: boolean
    hasAvailabilityChanged: boolean
    priceDiff: number
    changes: dbTypes.PriceChange[]
}
