import type { Event } from './event';

export class EventStreamSerializer {
    static encode(event: Event): string {
        return `${Buffer.from(JSON.stringify(event)).toString('base64')}\n`;
    }

    static decode(event: string): Event {

        const buffer = Buffer.from(event, 'base64');
        try {
            return JSON.parse(buffer.toString()) as Event;
        } catch (_e) {
            throw new Error(`Truncated event. Payload: ${event}, Decoded: ${buffer.toString()}.`);
        }
    }
}
