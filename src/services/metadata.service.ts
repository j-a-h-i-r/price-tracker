import z from 'zod';
import { knex } from '../core/db.ts';
import {
    BooleanFilter, NumericRangeFilter, StringFilter,
    type Metadata, type MetadataFilterOutput, type MetadataParser,
    type ParsedMetadata, type ParserOutput
} from '../types/metadata.types.ts';

/**
 * Source of truth for supported metadatas
 * @TODO: Probably should turn it into an array
 */
export const MetadataDefinitions: Metadata = {
    ram: {
        displayName: 'RAM',
        dataType: 'integer',
        unit: 'GB',
        type: 'range',
        key: 'ram',
    },
    weight: {
        displayName: 'Weight',
        dataType: 'float',
        unit: 'gm',
        type: 'range',
        key: 'weight',
    },
    sim_esim: {
        displayName: 'eSIM Support',
        dataType: 'boolean',
        type: 'boolean',
        key: 'sim_esim',
    },
    usb_type_c: {
        displayName: 'USB Type-C',
        dataType: 'boolean',
        type: 'boolean',
        key: 'usb_type_c',
    },
    usb_thunderbolt: {
        displayName: 'USB Thunderbolt',
        dataType: 'boolean',
        type: 'boolean',
        key: 'usb_thunderbolt',
    },
    usb_version: {
        displayName: 'USB Version',
        dataType: 'string',
        type: 'set',
        key: 'usb_version',
    },
    gpu_memory: {
        displayName: 'GPU Memory',
        dataType: 'integer',
        unit: 'GB',
        type: 'range',
        key: 'gpu_memory',
    },
    storage_size: {
        displayName: 'Storage Size',
        dataType: 'integer',
        unit: 'GB',
        type: 'range',
        key: 'storage_size',
    },
};

export function isMetadataKey(key: string): key is keyof Metadata {
    return key in MetadataDefinitions;
}

export const MetadataFiltersSchema = z.object({
    ram: NumericRangeFilter,
    weight: NumericRangeFilter,
    sim_esim: BooleanFilter,
    usb_type_c: BooleanFilter,
    usb_thunderbolt: BooleanFilter,
    usb_version: StringFilter,
    gpu_memory: NumericRangeFilter,
    storage_size: NumericRangeFilter,
}).partial();
export type MetadataFiltersSchema = z.infer<typeof MetadataFiltersSchema>;

/**
 * Given a key-value pair object and an array of keys,
 * this function returns the first defined (not null or undefined) value for
 * any of the keys in the kv pair
 * @param kv 
 * @param keys 
 * @returns 
 */
function parseFirstDefinedValue(kv: Record<string, string>, keys: string[]): string | null {
    for (const key of keys) {
        if (kv[key]) {
            return kv[key];
        }
    }
    return null;
}

const RAMParser: MetadataParser = {
    metadataKey: 'ram',
    parse(metadata: Record<string, string>): ParserOutput {
        const ramText = parseFirstDefinedValue(
            metadata, [
                'Memory >> RAM', 'Memory >> Memory Size', 'Main Feature >> RAM',
                'Storage >> ROM',
            ]
        );
        if (!ramText) {
            return { hasMetadata: false, parseSuccess: false, parsedMetadata: null };
        }

        const groups = /^(?<ram_amount>\d+)\s*(?<ram_unit>GB|MB)/i.exec(ramText)?.groups;
        if (!groups) {
            return { hasMetadata: true, parseSuccess: false, parsedMetadata: ramText };
        }
        const { ram_amount, ram_unit } = groups;
        let ramAmountNumeric = Number(ram_amount);
        if (ram_unit.toLowerCase() === 'mb') {
            ramAmountNumeric = ramAmountNumeric / 1024;
        }
        return {
            hasMetadata: true,
            parseSuccess: true,
            parsedMetadata: { [this.metadataKey]: ramAmountNumeric }
        };
    }
};

const GPUMemoryParser: MetadataParser = {
    metadataKey: 'gpu_memory',
    parse(metadata: Record<string, string>): ParserOutput {
        const gpuMemoryText = parseFirstDefinedValue(
            metadata,
            ['Graphics >> GPU Memory Size', 'Graphics >> Graphics Memory'],
        );
        if (!gpuMemoryText) {
            return { hasMetadata: false, parseSuccess: false, parsedMetadata: null };
        }
        const groups = /(?<gpu_amount>\d+)\s*(?<gpu_memory_unit>GB|MB)/i.exec(gpuMemoryText)?.groups;
        if (!groups) {
            return { hasMetadata: true, parseSuccess: false, parsedMetadata: gpuMemoryText };
        }
        const { gpu_amount, gpu_memory_unit } = groups;
        let gpumMemoryNumeric = Number(gpu_amount);
        if (gpu_memory_unit.toLowerCase() === 'mb') {
            gpumMemoryNumeric = gpumMemoryNumeric / 1024;
        }
        return {
            hasMetadata: true,
            parseSuccess: true,
            parsedMetadata: { [this.metadataKey]: gpumMemoryNumeric }
        };
    }
};

const WeightParser: MetadataParser = {
    metadataKey: 'weight',
    parse(metadata: Record<string, string>): ParserOutput {
        const { Weight: weight } = metadata;
        if (!weight) {
            return { hasMetadata: false, parseSuccess: false, parsedMetadata: null };
        }
        const groups = /\b(?<weight_amount>\d+(?:\.\d+)?)\s*(?<unit>kg|gm|lbs|lb|g)\b/i.exec(weight)?.groups;
        if (!groups) {
            return { hasMetadata: true, parseSuccess: false, parsedMetadata: weight };
        }
        const { weight_amount, unit } = groups;
        let weightAmountNumeric = Number(weight_amount);
        const unitLower = unit.toLowerCase();
        if (unitLower === 'kg') {
            weightAmountNumeric = weightAmountNumeric * 1000;
        } else if (unitLower === 'lbs' || unitLower === 'lb') {
            weightAmountNumeric = weightAmountNumeric * 453.592; // Convert lbs to grams
        }

        return {
            hasMetadata: true,
            parseSuccess: true,
            parsedMetadata: { [this.metadataKey]: weightAmountNumeric }
        };
    }
};

const SIMParser: MetadataParser = {
    metadataKey: 'sim_esim',
    parse(metadata: Record<string, string>): ParserOutput {
        const { SIM: sim } = metadata;
        if (!sim) {
            return { hasMetadata: false, parseSuccess: false, parsedMetadata: null };
        }
        let parsedSim: Partial<ParsedMetadata> = {
            sim_esim: false
        };
        if (sim.toLowerCase().includes('esim')) {
            parsedSim = { sim_esim: true };
        }
        return { hasMetadata: true, parseSuccess: true, parsedMetadata: parsedSim };
    }
};

const USBParser: MetadataParser = {
    metadataKey: 'sim_esim',
    parse(metadata: Record<string, string>): ParserOutput {
        // eslint-disable-next-line prefer-const
        let { USB: usb, 'USB Type-C / Thunderbolt Port': usb_port } = metadata;
        if (!usb && !usb_port) {
            return { hasMetadata: false, parseSuccess: false, parsedMetadata: null };
        }
        
        if (usb_port) {
            usb = usb_port;
        }

        const parsedUsb: Partial<ParsedMetadata> = {
            usb_type_c: false,
            usb_thunderbolt: false,
        };

        if (/type-c/i.test(usb) || /usb-c/i.test(usb)) {
            parsedUsb.usb_type_c = true;
        }

        if (/thunderbolt/i.test(usb)) {
            parsedUsb.usb_thunderbolt = true;
        }

        if (/\b2.0\b/.test(usb)) {
            parsedUsb.usb_version = '2';
        } else if (/\b3.\d\b/.test(usb)) {
            parsedUsb.usb_version = '3';
        }

        return { hasMetadata: true, parseSuccess: true, parsedMetadata: parsedUsb };
    }
};

const StorageSizeParser: MetadataParser = {
    metadataKey: 'storage_size',
    parse(metadata: Record<string, string>): ParserOutput {
        const storageSizeText = parseFirstDefinedValue(
            metadata,
            [
                'Main Feature >> Storage', 'Storage >> Storage', 'Storage >> ROM',
                'Storage >> Storage Capacity',
            ],
        );
        if (!storageSizeText) {
            return { hasMetadata: false, parseSuccess: false, parsedMetadata: null };
        }
        const groups = /^(?<storage_amount>\d+)\s*(?<storage_unit>GB|MB|TB)/i.exec(storageSizeText)?.groups;
        if (!groups) {
            return { hasMetadata: true, parseSuccess: false, parsedMetadata: storageSizeText };
        }
        const { storage_amount, storage_unit } = groups;
        let storageSizeNumeric = Number(storage_amount);
        if (storage_unit.toLowerCase() === 'mb') {
            storageSizeNumeric = storageSizeNumeric / 1024;
        } else if (storage_unit.toLowerCase() === 'tb') {
            storageSizeNumeric = storageSizeNumeric * 1024; // Convert TB to GB
        }
        return {
            hasMetadata: true,
            parseSuccess: true,
            parsedMetadata: { [this.metadataKey]: storageSizeNumeric }
        };
    }
};

export const metadataParsers: MetadataParser[] = [
    RAMParser,
    WeightParser,
    SIMParser,
    USBParser,
    GPUMemoryParser,
    StorageSizeParser,
];

/**
 * Given a metadata key, fetch the minimum and maximum value for that metadata
 * from the "external_products" table.
 * @param metadata 
 * @returns 
 */
function fetchMinMaxValuesForMetadata(metadata: keyof Metadata): Promise<{ min: number; max: number }> {
    return knex('external_products')
        .select(
            knex.raw('floor(MIN((parsed_metadata ->> ?)::float)) as min', [metadata]),
            knex.raw('ceil(MAX((parsed_metadata ->> ?)::float)) as max', [metadata]),
        ).first();
}

/**
 * Given a metadata key, fetch the unique string values for that metadata
 * @param metadata 
 * @returns 
 */
function fetchUniqueStringValuesForMetadata(metadata: keyof Metadata): Promise<{ value: string }[]> {
    return knex('external_products')
        .select(
            knex.raw('DISTINCT(parsed_metadata ->> ?) as value', [metadata]),
        )
        .whereRaw('parsed_metadata ->> ? IS NOT NULL', [metadata]);
}

/**
 * Generate a list of available metadata filters based on the metadata definitions.
 * @returns 
 */
export async function generateAvailableMetadataFilters() {
    const filters = await Promise.all(
        Object.keys(MetadataDefinitions)
        .filter(key => isMetadataKey(key))
        .map(async (_key): Promise<MetadataFilterOutput | undefined> => {
            const prop = MetadataDefinitions[_key];
            if (prop.type === 'range') {
                const { min, max } = await fetchMinMaxValuesForMetadata(prop.key);
                return {
                    key: prop.key,
                    display_text: `${prop.displayName} (${prop.unit})`,
                    unit: prop.unit,
                    type: 'range',
                    value: {
                        min: min,
                        max: max,
                    },
                };
            } else if (prop.type === 'boolean') {
                return {
                    key: prop.key,
                    display_text: prop.displayName,
                    type: 'boolean',
                };
            } else if (prop.type === 'set') {
                const uniqueValues = await fetchUniqueStringValuesForMetadata(prop.key);
                return {
                    key: prop.key,
                    display_text: prop.displayName,
                    type: 'set',
                    value: uniqueValues.map((row) => row.value),
                };
            }
        })
    );
    return filters;
}
