import { Transform } from 'stream';
import type { TransformCallback } from 'stream';

const NEWLINE = 0x0A;

export class LineEventDecoder extends Transform {
    private remainder = Buffer.alloc(0);

    override _transform(chunk: Buffer, _encoding: string, callback: TransformCallback) {
        const data = this.remainder.length > 0
            ? Buffer.concat([this.remainder, chunk])
            : chunk;

        const segments = this.splitOnNewline(data);
        this.remainder = Buffer.from(segments.pop()!);

        for (const segment of segments) {
            if (segment.length > 0) this.push(segment);
        }

        callback();
    }

    override _flush(callback: TransformCallback) {
        if (this.remainder.length > 0) {
            this.push(this.remainder);
            this.remainder = Buffer.alloc(0);
        }
        callback();
    }

    private splitOnNewline(data: Buffer): Buffer[] {
        const segments: Buffer[] = [];
        let start = 0;
        let index: number;

        while ((index = data.indexOf(NEWLINE, start)) !== -1) {
            segments.push(data.subarray(start, index));
            start = index + 1;
        }

        segments.push(Buffer.from(data.subarray(start)));
        return segments;
    }
}
