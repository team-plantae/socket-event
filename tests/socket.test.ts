import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Socket } from '../src/socket';
import { Socket as NetSocket } from 'net';
import { EventStreamSerializer } from '../src/event-stream-serializer';
import { Event } from '../src/event';
import type { MockedObject } from 'vitest';

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


describe('Socket', () => {

    beforeEach(() => {
        vi.mocked(NetSocket).mockClear();
    });

    it('should terminate TCP connection on close', () => {
        const netSocket = new NetSocket() as MockedObject<NetSocket>;
        const socket = new Socket(netSocket);

        const closeListener = vi.fn();
        socket.on('close', closeListener);

        netSocket.emit('close');

        expect(closeListener).toHaveBeenCalled();
    });

    it('should emit an error event on socket error', () => {
        const netSocket = new NetSocket() as MockedObject<NetSocket>;
        const socket = new Socket(netSocket);

        const errorListener = vi.fn();
        socket.on('error', errorListener);

        const error = new Error('Connection error');
        netSocket.emit('error', error);

        expect(errorListener).toHaveBeenCalledWith(error);
    });

    it('should handle data event correctly with encoded event data', () => {
        const netSocket = new NetSocket() as MockedObject<NetSocket>;
        const socket = new Socket(netSocket);

        const dataListener = vi.fn();
        socket.on('data-event', dataListener);

        const param = { message: 'test' };
        const event: Event = { name: 'data-event', params: [param] };
        const encodedData = EventStreamSerializer.encode(event);

        netSocket.emit('data', Buffer.from(encodedData));

        expect(dataListener).toHaveBeenCalledWith(param);
    });

    it('should encode and send event data to the socket when emit is called', () => {
        const netSocket = new NetSocket() as MockedObject<NetSocket>;
        const socket = new Socket(netSocket);

        const eventName = 'test-event';
        const eventArgs = [1, 'test', true];

        socket.emit(eventName, ...eventArgs);

        const expectedMessage = EventStreamSerializer.encode({ name: eventName, params: eventArgs });
        expect(netSocket.write).toHaveBeenCalledWith(expectedMessage);
    });

    it('should not emit the event internally when emit is called', () => {
        const netSocket = new NetSocket() as MockedObject<NetSocket>;
        const socket = new Socket(netSocket);

        const eventName = 'test-event';
        const listener = vi.fn();

        socket.on(eventName, listener);

        socket.emit(eventName);
        expect(listener).not.toHaveBeenCalled();
    });

    it('should destroy the underlying NetSocket when destroy is called', () => {
        const netSocket = new NetSocket() as MockedObject<NetSocket>;
        const socket = new Socket(netSocket);

        socket.destroy();
        expect(netSocket.destroy).toHaveBeenCalled();
    });

    it('should end the connection and resolve after disconnect', () => {
        const netSocket = new NetSocket() as MockedObject<NetSocket>;
        const socket = new Socket(netSocket);
        const disconnectPromise = socket.disconnect();

        expect(netSocket.end).toHaveBeenCalled();
        expect(disconnectPromise).resolves.toBeUndefined();
    });
});
