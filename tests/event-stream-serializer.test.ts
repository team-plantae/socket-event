import { describe, it, expect } from 'vitest';
import { EventStreamSerializer } from '../src/event-stream-serializer';
import type { Event } from '../src/event';

describe('EventStreamSerializer', () => {
    
    it('should encode and decode a simple event with no data', () => {
        const event: Event = { name: 'simple-event' };
        const encoded = EventStreamSerializer.encode(event);
        const decoded = EventStreamSerializer.decode(encoded.trim());

        expect(decoded).toEqual(event);
    });

    it('should encode and decode an event with a boolean payload', () => {
        const event: Event = { name: 'boolean-event', data: true };
        const encoded = EventStreamSerializer.encode(event);
        const decoded = EventStreamSerializer.decode(encoded.trim());

        expect(decoded).toEqual(event);
    });

    it('should encode and decode an event with a complex object payload', () => {
        const event: Event = { 
            name: 'weight-event',
            data: { weight: 75, stable: true } 
        };
        const encoded = EventStreamSerializer.encode(event);
        const decoded = EventStreamSerializer.decode(encoded.trim());

        expect(decoded).toEqual(event);
    });

    it('should throw an error when decoding an invalid encoded string', () => {
        const encoded = 'invalid-encoded-string';

        expect(() => EventStreamSerializer.decode(encoded)).toThrow(Error);
    });
});
