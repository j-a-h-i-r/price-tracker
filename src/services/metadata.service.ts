export type ParsedMetadata = Partial<{
    ram: string;
    weight: string;
    sim_esim: boolean;
    usb_type_c: boolean;
    usb_thunderbolt: boolean;
    usb_version: "2" | "3";
}>

export type MetadataKey = keyof ParsedMetadata;
export type MetadataProperty = {
    displayName: string;
    dataType?: 'string' | 'number' | 'boolean';
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
    },
    weight: {
        displayName: 'Weight',
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
};

const RAMParser: MetadataParser = {
    metadataKey: 'ram',
    parse(metadata: Record<string, string>): ParserOutput {
        const { RAM } = metadata;
        if (!RAM) {
            return { hasMetadata: false, parseSuccess: false, parsedMetadata: null };
        }
        const ramMatches = RAM ? RAM.match(/(\d+)\s*(GB|MB)/ig) : null;
        if (!ramMatches) {
            return { hasMetadata: true, parseSuccess: false, parsedMetadata: RAM };
        }
        return {
            hasMetadata: true,
            parseSuccess: true,
            parsedMetadata: { [this.metadataKey]: ramMatches[0].replace(" ", "") }
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
        const weightMatches = weight.match(/(\d+)\s*(kg|g)/i);
        if (!weightMatches) {
            return { hasMetadata: true, parseSuccess: false, parsedMetadata: weight };
        }
        return {
            hasMetadata: true,
            parseSuccess: true,
            parsedMetadata: { [this.metadataKey]: weightMatches[0].replace(" ", "") }
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
        let { USB: usb, "USB Type-C / Thunderbolt Port": usb_port } = metadata;
        if (!usb && !usb_port) {
            return { hasMetadata: false, parseSuccess: false, parsedMetadata: null };
        }
        
        if (usb_port) {
            usb = usb_port;
        }

        let parsedUsb: ParsedMetadata = {
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

export const metadataParsers: MetadataParser[] = [
    RAMParser,
    WeightParser,
    SIMParser,
    USBParser,
];
