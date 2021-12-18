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

export type ExceptId <T> = Omit<T, "id">;
