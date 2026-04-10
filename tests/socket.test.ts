import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Socket } from '../src/socket';
import { Socket as NetSocket } from 'net';
import { EventStreamSerializer } from '../src/event-stream-serializer';
import type { Event } from '../src/event';
import type { MockedObject } from 'vitest';

vi.mock('net', async () => import('./mocks/net'));


describe('Socket', () => {

    beforeEach(() => {
        vi.mocked(NetSocket).mockClear();
    });

    it('should emit an "connect" event when the underlying socket establishes a connection', () => {
        const netSocket = new NetSocket() as MockedObject<NetSocket>;
        const socket = new Socket(netSocket);
    
        const listener = vi.fn();
        socket.on('connect', listener);
    
        netSocket.emit('connect');
    
        expect(listener).toHaveBeenCalled();
    });

    it('should emit an "close" event when the underlying socket closes', () => {
        const netSocket = new NetSocket() as MockedObject<NetSocket>;
        const socket = new Socket(netSocket);

        const listener = vi.fn();
        socket.on('close', listener);

        netSocket.emit('close');

        expect(listener).toHaveBeenCalled();
    });

    it('should emit an "end" event when the underlying socket ends', () => {
        const netSocket = new NetSocket() as MockedObject<NetSocket>;
        const socket = new Socket(netSocket);
    
        const listener = vi.fn();
        socket.on('end', listener);
    
        netSocket.emit('end');
    
        expect(listener).toHaveBeenCalled();
    });

    it('should emit an "error" event when there is a socket error', () => {
        const netSocket = new NetSocket() as MockedObject<NetSocket>;
        const socket = new Socket(netSocket);

        const listener = vi.fn();
        socket.on('error', listener);

        const error = new Error('Connection error');
        netSocket.emit('error', error);

        expect(listener).toHaveBeenCalledWith(error);
    });

    it('should handle data event correctly with encoded event data', () => {
        const netSocket = new NetSocket() as MockedObject<NetSocket>;
        const socket = new Socket(netSocket);

        const dataListener = vi.fn();
        socket.on('data-event', dataListener);

        const param = { message: 'test' };
        const event: Event = { name: 'data-event', data: param };
        const encodedData = EventStreamSerializer.encode(event);

        netSocket.emit('data', Buffer.from(encodedData));

        expect(dataListener).toHaveBeenCalledWith(param);
    });

    it('should emit an error when receiving malformed data', () => {
        const netSocket = new NetSocket() as MockedObject<NetSocket>;
        const socket = new Socket(netSocket);

        const errorListener = vi.fn();
        socket.on('error', errorListener);

        netSocket.emit('data', Buffer.from('not-valid-base64\n'));

        expect(errorListener).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should encode and send event data to the socket when emit is called', () => {
        const netSocket = new NetSocket() as MockedObject<NetSocket>;
        const socket = new Socket(netSocket);

        const eventName = 'test-event';
        const eventData = { id: 1, label: 'test', active: true };

        socket.emit(eventName, eventData);

        const expectedMessage = EventStreamSerializer.encode({ name: eventName, data: eventData });
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

    it('should end the connection and resolve after disconnect', async () => {
        const netSocket = new NetSocket() as MockedObject<NetSocket>;
        const socket = new Socket(netSocket);

        const disconnectPromise = socket.disconnect();
        const closeHandler = netSocket.once.mock.calls.find(([event]) => String(event) === 'close')?.[1];
        closeHandler?.();

        expect(netSocket.end).toHaveBeenCalled();
        await expect(disconnectPromise).resolves.toBeUndefined();
    });

    it('should not emit event from incomplete data', () => {
        const netSocket = new NetSocket() as MockedObject<NetSocket>;
        const socket = new Socket(netSocket);
        const listener = vi.fn();
        socket.on('partial-event', listener);

        const event: Event = { name: 'partial-event', data: 'hello' };
        const encoded = EventStreamSerializer.encode(event);
        const midpoint = Math.floor(encoded.length / 2);
        netSocket.emit('data', Buffer.from(encoded.slice(0, midpoint)));

        expect(listener).not.toHaveBeenCalled();
    });

    it('should emit event when partial chunks complete a full message', () => {
        const netSocket = new NetSocket() as MockedObject<NetSocket>;
        const socket = new Socket(netSocket);
        const listener = vi.fn();
        socket.on('partial-event', listener);

        const event: Event = { name: 'partial-event', data: 'hello' };
        const encoded = EventStreamSerializer.encode(event);
        const midpoint = Math.floor(encoded.length / 2);
        netSocket.emit('data', Buffer.from(encoded.slice(0, midpoint)));
        netSocket.emit('data', Buffer.from(encoded.slice(midpoint)));

        expect(listener).toHaveBeenCalledWith('hello');
    });

    it('should handle multiple events arriving in a single chunk', () => {
        const netSocket = new NetSocket() as MockedObject<NetSocket>;
        const socket = new Socket(netSocket);

        const listener = vi.fn();
        socket.on('multi', listener);

        const event1 = EventStreamSerializer.encode({ name: 'multi', data: 1 });
        const event2 = EventStreamSerializer.encode({ name: 'multi', data: 2 });

        // Both events in a single data chunk
        netSocket.emit('data', Buffer.from(event1 + event2));

        expect(listener).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenNthCalledWith(1, 1);
        expect(listener).toHaveBeenNthCalledWith(2, 2);
    });
});
