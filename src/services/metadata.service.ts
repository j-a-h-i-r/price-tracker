import { knex } from '../core/db.ts';

export type MetadataDataType = 'string' | 'integer' | 'float' | 'boolean';

export type ParsedMetadata = Partial<{
    ram: string;
    weight: number;
    sim_esim: boolean;
    usb_type_c: boolean;
    usb_thunderbolt: boolean;
    usb_version: '2' | '3';
    gpu_memory: number;
    storage_size: number;
}>

export type MetadataKey = keyof ParsedMetadata;
export type MetadataProperty = {
    displayName: string;
    dataType?: MetadataDataType;
    unit?: string;
}

interface ParserOutputSuccess {
    hasMetadata: true;
    parseSuccess: true;
    parsedMetadata: ParsedMetadata;
}

interface ParserOutputFailure {
    hasMetadata: true;
    parseSuccess: false;
    parsedMetadata: string;
}

interface ParserOutputNoOp {
    hasMetadata: false;
    parseSuccess: false;
    parsedMetadata: null;
}

export type ParserOutput = ParserOutputSuccess | ParserOutputFailure | ParserOutputNoOp;

export interface MetadataParser {
    metadataKey: MetadataKey;
    parse: (metadata: Record<string, string>) => ParserOutput;
}

export const MetadataDefinitions: Record<MetadataKey, MetadataProperty> ={
    ram: {
        displayName: 'RAM',
        dataType: 'integer',
        unit: 'GB',
    },
    weight: {
        displayName: 'Weight',
        dataType: 'float',
        unit: 'gm',
    },
    sim_esim: {
        displayName: 'eSIM Support',
        dataType: 'boolean',
    },
    usb_type_c: {
        displayName: 'USB Type-C',
        dataType: 'boolean',
    },
    usb_thunderbolt: {
        displayName: 'USB Thunderbolt',
        dataType: 'boolean',
    },
    usb_version: {
        displayName: 'USB Version',
        dataType: 'string',
    },
    gpu_memory: {
        displayName: 'GPU Memory',
        dataType: 'integer',
        unit: 'GB',
    },
    storage_size: {
        displayName: 'Storage Size',
        dataType: 'integer',
        unit: 'GB',
    }
};

function parseFirstValidValue(kv: Record<string, string>, keys: string[]): string | null {
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
        const ramText = parseFirstValidValue(
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
        const gpuMemoryText = parseFirstValidValue(
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
        let parsedSim: ParsedMetadata = {
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

        const parsedUsb: ParsedMetadata = {
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
        const storageSizeText = parseFirstValidValue(
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

function fetchMinMaxValues(metadata: MetadataKey)  {
    return knex('internal_products')
        .select(
            knex.raw('MIN((parsed_metadata ->> ?)::float) as min', [metadata]),
            knex.raw('MAX((parsed_metadata ->> ?)::float) as max', [metadata]),
        ).first();
}

function fetchUniqueStrings(metadata: MetadataKey) {
    return knex('internal_products')
        .select(
            knex.raw('DISTINCT(parsed_metadata ->> ?) as value', [metadata]),
        )
        .whereRaw('parsed_metadata ->> ? IS NOT NULL', [metadata]);
}

export async function metadataFilters() {
    const filters = await Promise.all(Object.keys(MetadataDefinitions).map(async (key) => {
        const metadataKey = key as MetadataKey;
        const metadataProperty = MetadataDefinitions[metadataKey];
        if (
            metadataProperty?.dataType
            && ['integer', 'float'].includes(metadataProperty.dataType)
        ) {
            const { min, max } = await fetchMinMaxValues(metadataKey);
            return {
                key: metadataKey,
                displayName: metadataProperty.displayName,
                unit: metadataProperty.unit,
                type: 'range',
                range: {
                    min: min,
                    max: max,
                }
            };
            // Add a filter for number type
        } else if (metadataProperty.dataType === 'boolean') {
            return {
                key: metadataKey,
                displayName: metadataProperty.displayName,
                unit: metadataProperty.unit,
                type: 'boolean',
            };
        } else if (metadataProperty.dataType === 'string') {
            const uniqueValues = await fetchUniqueStrings(metadataKey);
            return {
                key: metadataKey,
                displayName: metadataProperty.displayName,
                unit: metadataProperty.unit,
                type: 'string',
                values: uniqueValues.map((row) => row.value),
            };
        }
    }));
    return filters;
}