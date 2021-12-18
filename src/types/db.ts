export interface GpuPrices {
    gpuid: number
    is_available: boolean
    price: number
    updated_at: string | Date
}

export interface Gpus {
    id: number
    name: string
    url: string
    slug: string
    website: string
}
