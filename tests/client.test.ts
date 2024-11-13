import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Client } from '../src/client';
import { Socket as NetSocket } from 'net';

vi.mock('net', () => ({
    Socket: vi.fn().mockImplementation(function () {
        return {
            handlers: {} as Record<string, Array<(...args: any[]) => void>>,
            connect: vi.fn().mockReturnThis(),
            destroy: vi.fn(),
            write: vi.fn(),
            end: vi.fn(function (this: any) {
                this.emit('close');
            }),
            on: vi.fn(function (this: any, event: string, callback: (...args: any[]) => void) {
                if (!this.handlers[event]) {
                    this.handlers[event] = [];
                }
                this.handlers[event].push(callback);
                return this;
            }),
            once: vi.fn(function (this: any, event: string, callback: (...args: any[]) => void) {
                const onceWrapper = (...args: any[]) => {
                    callback(...args);
                    this.handlers[event] = this.handlers[event].filter((fn: (...args: any[]) => void) => fn !== onceWrapper);
                };
                this.on(event, onceWrapper);
                return this;
            }),
            emit: vi.fn(function (this: any, event: string, ...args: any[]) {
                if (this.handlers[event]) {
                    this.handlers[event].forEach((callback: (...args: any[]) => void) => callback(...args));
                }
                return this;
            }),
        };
    }),
}));

describe('Client', () => {

    beforeEach(() => {
        vi.mocked(NetSocket).mockClear();
    });

    it('should connect to the given host and port', () => {
        const host = 'localhost';
        const port = 3000;

        new Client(host, port);

        const netSocketInstance = vi.mocked(NetSocket).mock.results[0].value;
        expect(netSocketInstance.connect).toHaveBeenCalledWith(port, host);
    });

    it('should inherit methods from Socket', () => {
        const host = 'localhost';
        const port = 3000;

        const client = new Client(host, port);

        expect(client).toHaveProperty('emit');
        expect(client).toHaveProperty('on');
    });
});
