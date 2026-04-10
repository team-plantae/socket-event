import { vi } from 'vitest';

type Handler = (...args: any[]) => void;

function createMockSocket() {
    return {
        handlers: {} as Record<string, Handler[]>,
        connect: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
        write: vi.fn(),
        end: vi.fn(function (this: any) {
            this.emit('close');
        }),
        pipe: vi.fn(function (this: any, destination: any) {
            this.on('data', (chunk: any) => destination.write(chunk));
            return destination;
        }),
        on: vi.fn(function (this: any, event: string, callback: Handler) {
            if (!this.handlers[event]) this.handlers[event] = [];
            this.handlers[event].push(callback);
            return this;
        }),
        once: vi.fn(function (this: any, event: string, callback: Handler) {
            const wrapper = (...args: any[]) => {
                callback(...args);
                this.handlers[event] = this.handlers[event].filter((fn: Handler) => fn !== wrapper);
            };
            this.on(event, wrapper);
            return this;
        }),
        emit: vi.fn(function (this: any, event: string, ...args: any[]) {
            this.handlers[event]?.forEach((cb: Handler) => cb(...args));
            return this;
        }),
    };
}

function createMockServer() {
    return {
        handlers: {} as Record<string, Handler>,
        listen: vi.fn().mockReturnThis(),
        close: vi.fn(),
        on: vi.fn(function (this: any, event: string, callback: Handler) {
            this.handlers[event] = callback;
            return this;
        }),
        once: vi.fn(function (this: any, event: string, callback: Handler) {
            this.handlers[event] = (...args: any[]) => {
                callback(...args);
                delete this.handlers[event];
            };
        }),
        emit: vi.fn(function (this: any, event: string, ...args: any[]) {
            this.handlers[event]?.(...args);
        }),
    };
}

export const Socket = vi.fn().mockImplementation(function () { return createMockSocket(); });
export const Server = vi.fn().mockImplementation(function () { return createMockServer(); });
