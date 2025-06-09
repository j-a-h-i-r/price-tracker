import { MetadataDefinitions, type MetadataKey, type MetadataProperty } from './metadata.service.ts';

/**
 * This is like a wrapper on top of the metadata definitions.
 * Selecting a subset of metadata properties that are relevant for variants.
 */
export const VariantAttributes: Partial<Record<MetadataKey, MetadataProperty>> = {
    ram: MetadataDefinitions.ram,
    gpu_memory: MetadataDefinitions.gpu_memory,
};
