import z from 'zod';

export type MetadataDataType = 'string' | 'integer' | 'float' | 'boolean';
export type MetadataType = 'range' | 'boolean' | 'set';

interface MetadataProps {
    // Friendly name to display in the UI
    displayName: string;
    // The internal data type of the metadata value
    // This is used for parsing and filtering the metadata
    dataType: MetadataDataType;
    // The type of metadata value
    type: MetadataType;
}

// Specialized interface to hold numeric metadata values
// Numeric metadata means it can be used in range filters
// For example, RAM, Weight, GPU Memory, Storage Size
interface RangeMetadataProps extends MetadataProps {
    dataType: 'integer' | 'float';
    type: 'range';
    unit: string;
}

// Specialized interface to hold boolean metadata values
// For example, whether a product has USB Type-C or Thunderbolt support
interface BooleanMetadataProps extends MetadataProps {
    dataType: 'boolean';
    type: 'boolean';
}

// Specialized interface to hold a set of metadata values
// For example, USB versions, Process Types, etc.
// Since these are just a collection of values, the dataType can be anything
// So it supports a generic type
interface SetMetadataProps<T extends MetadataDataType = 'string'> extends MetadataProps {
    dataType: T;
    type: 'set';
}

// Main Metadata interface that defines the structure of metadata
// Each key corresponds to a specific metadata property
interface _Metadata {
    ram: RangeMetadataProps;
    weight: RangeMetadataProps;
    sim_esim: BooleanMetadataProps;
    usb_type_c: BooleanMetadataProps;
    usb_thunderbolt: BooleanMetadataProps;
    usb_version: SetMetadataProps<'string'>;
    gpu_memory: RangeMetadataProps;
    storage_size: RangeMetadataProps;
}

// Adding a "key" property to each metadata type. This allows TS to narrow the "key" when
// "type" is specified.
export type Metadata = {
    [K in keyof _Metadata]: _Metadata[K] & {
        key: K,
        type: _Metadata[K]['type']
    };
}

export type MetadataKey = keyof Metadata;

// Structure of the metadata after it's been parsed. This is a simplified key-value pair 
// with proper types based on the metadata definition. Once the raw metadata is parsed,
// it should follow this structure
export type ParsedMetadata = {
    [K in keyof Metadata]: Metadata[K]['dataType'] extends 'integer' | 'float'
        ? number
        : Metadata[K]['dataType'] extends 'boolean'
            ? boolean
            : Metadata[K]['dataType'] extends 'string'
                ? string
                : never;
};


// Interface for the outputs of the metadata filter. 
// The listed of supported metadata sent via API will follow this structure
type PropsToRemoveFromFilterOutput = keyof MetadataProps | 'dataType';
interface RangeMetadataFilterOutput extends Omit<RangeMetadataProps, PropsToRemoveFromFilterOutput> {
    value: {
        min: number;
        max: number;
    }
}

type BooleanMetadataFilterOutput = Omit<BooleanMetadataProps, PropsToRemoveFromFilterOutput>;

interface SetMetadataFilterOutput<T> extends Omit<SetMetadataProps, PropsToRemoveFromFilterOutput> {
    value: T[];
}

// Shape of the expected output for the metadata filter for all metadata.
export type MetadataFilterOutput = {
    [K in keyof Metadata]: {
        display_text: string;
        key: K;
        type: Metadata[K]['type'];
    } & (
        Metadata[K]['type'] extends 'range'
            ? RangeMetadataFilterOutput
            : Metadata[K]['type'] extends 'boolean'
                ? BooleanMetadataFilterOutput
                : Metadata[K]['type'] extends 'set'
                    ? SetMetadataFilterOutput<ParsedMetadata[K]>
                    : never
    )
}[keyof Metadata];


// Defining the parser output types for the metadata parser.
interface ParserOutputSuccess {
    // Indicates that the metadata was contained in the raw input
    hasMetadata: true;
    // And was parsed successfully
    parseSuccess: true;
    // The parsed metadata
    parsedMetadata: Partial<ParsedMetadata>;
}

interface ParserOutputFailure {
    // Indicates that the metadata was contained in the raw input
    hasMetadata: true;
    // But was not parsed successfully
    parseSuccess: false;
    // The raw metadata, which is a string in this case
    // This is to store it to review later
    parsedMetadata: string;
}

interface ParserOutputNoOp {
    // Indicates that the metadata was not contained in the raw input
    hasMetadata: false;
    parseSuccess: false;
    parsedMetadata: null;
}

export type ParserOutput = ParserOutputSuccess | ParserOutputFailure | ParserOutputNoOp;

// All parsers must implement this interface
export interface MetadataParser {
    // The key of the metadata that this parser handles
    // For now each parser handles only one metadata key
    metadataKey: keyof Metadata;
    // This function takes the raw metadata as input and returns the parsed output
    parse: (metadata: Record<string, string>) => ParserOutput;
}


// Validation schemas for the metadata filter inputs
export const StringFilter = z.string();
export type StringFilter = z.infer<typeof StringFilter>;
export const NumericRangeFilter = z.record(
    z.enum(['eq', 'gt', 'lt']),
    z.coerce.number()
).refine((data) => {
    // Ensure that at least one of the conditions is provided
    return Object.values(data).some(value => value !== undefined);
}, 'At least one of eq/gt/lt must be provided');
export type NumericRangeFilter = z.infer<typeof NumericRangeFilter>;
 
export const BooleanFilter = z.coerce.boolean();
export type BooleanFilter = z.infer<typeof BooleanFilter>;
export const NumericFilter = z.coerce.number();
export type NumericFilter = z.infer<typeof NumericFilter>;
