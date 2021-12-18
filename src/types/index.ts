export interface Gpu {
    name: string
    slug: string
    link: string
}

export interface GpuPrice extends Gpu {
    price: number
    isAvailable: boolean
}
