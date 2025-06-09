import { Transform, type TransformCallback } from 'stream';

export class DedupeStream extends Transform {
    private seen: Set<string>;
    private uniqueAttrGetter: (item: any) => string;

    constructor(uniqueAttrGetter: (item: any) => string) {
        super({ objectMode: true });
        this.seen = new Set();
        this.uniqueAttrGetter = uniqueAttrGetter;
    }

    _transform(chunk: any[], encoding: BufferEncoding, callback: TransformCallback): void {
        const deduped = chunk.filter((item) => {
            const uniqueAttr = this.uniqueAttrGetter(item);
            if (this.seen.has(uniqueAttr)) {
                return false;
            }
            this.seen.add(uniqueAttr);
            return true;
        });
        this.push(deduped);
        callback();
    }
}
