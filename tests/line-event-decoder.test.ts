import { describe, it, expect } from 'vitest';
import { LineEventDecoder } from '../src/line-event-decoder';

function collect(decoder: LineEventDecoder): Promise<Buffer[]> {
    return new Promise((resolve) => {
        const chunks: Buffer[] = [];
        decoder.on('data', (chunk: Buffer) => chunks.push(chunk));
        decoder.on('end', () => resolve(chunks));
    });
}

describe('LineEventDecoder', () => {

    it('should emit a single complete line', async () => {
        const decoder = new LineEventDecoder();
        const result = collect(decoder);

        decoder.write(Buffer.from('abc\n'));
        decoder.end();

        const chunks = await result;
        expect(chunks).toHaveLength(1);
        expect(chunks[0]!.toString()).toBe('abc');
    });

    it('should emit multiple lines from a single chunk', async () => {
        const decoder = new LineEventDecoder();
        const result = collect(decoder);

        decoder.write(Buffer.from('abc\ndef\n'));
        decoder.end();

        const chunks = await result;
        expect(chunks).toHaveLength(2);
        expect(chunks[0]!.toString()).toBe('abc');
        expect(chunks[1]!.toString()).toBe('def');
    });

    it('should not emit until a newline is received', async () => {
        const decoder = new LineEventDecoder();
        const chunks: Buffer[] = [];
        decoder.on('data', (chunk: Buffer) => chunks.push(chunk));

        decoder.write(Buffer.from('abc'));
        await new Promise((resolve) => process.nextTick(resolve));

        expect(chunks).toHaveLength(0);
        decoder.end();
    });

    it('should reassemble data split across chunks', async () => {
        const decoder = new LineEventDecoder();
        const result = collect(decoder);

        decoder.write(Buffer.from('ab'));
        decoder.write(Buffer.from('c\n'));
        decoder.end();

        const chunks = await result;
        expect(chunks).toHaveLength(1);
        expect(chunks[0]!.toString()).toBe('abc');
    });

    it('should flush remaining data on stream end', async () => {
        const decoder = new LineEventDecoder();
        const result = collect(decoder);

        decoder.write(Buffer.from('abc'));
        decoder.end();

        const chunks = await result;
        expect(chunks).toHaveLength(1);
        expect(chunks[0]!.toString()).toBe('abc');
    });

    it('should ignore empty lines between newlines', async () => {
        const decoder = new LineEventDecoder();
        const result = collect(decoder);

        decoder.write(Buffer.from('abc\n\ndef\n'));
        decoder.end();

        const chunks = await result;
        expect(chunks).toHaveLength(2);
        expect(chunks[0]!.toString()).toBe('abc');
        expect(chunks[1]!.toString()).toBe('def');
    });

    it('should handle large payloads', async () => {
        const decoder = new LineEventDecoder();
        const result = collect(decoder);
        const payload = 'x'.repeat(10_000);

        decoder.write(Buffer.from(payload + '\n'));
        decoder.end();

        const chunks = await result;
        expect(chunks).toHaveLength(1);
        expect(chunks[0]!.toString()).toBe(payload);
    });
});
