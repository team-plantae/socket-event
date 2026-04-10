import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Server } from '../src/server';
import { Socket as NetSocket, Server as NetServer } from 'net';
import { Socket } from '../src/socket';
import type { Event } from '../src/event';
import { EventStreamSerializer } from '../src/event-stream-serializer';

vi.mock('net', async () => import('./mocks/net'));

describe('Server', () => {

    beforeEach(() => {
        vi.mocked(NetServer).mockClear();
        vi.mocked(NetSocket).mockClear();
    });

    it('should start listening on the specified port', () => {

        const server = new Server(3000);
        server.start();

        const netServerInstance = vi.mocked(NetServer).mock.results[0]!.value;
        expect(netServerInstance.listen).toHaveBeenCalledWith(3000);
    });

    it('should hanle a new connection and emit connection event', () => {

        const server = new Server(3000);
        server.start();

        const connectionListener = vi.fn();
        server.on('connection', connectionListener);

        // Simula conexão de cliente
        const netServerInstance = vi.mocked(NetServer).mock.results[0]!.value;
        netServerInstance.emit('connection', new NetSocket());

        expect(connectionListener).toHaveBeenCalledWith(expect.any(Socket));
    });

    it('should handle disconnection and emit disconnection event', () => {

        const server = new Server(3000);
        server.start();

        // Simula conexão de cliente
        const netServerInstance = vi.mocked(NetServer).mock.results[0]!.value;
        netServerInstance.emit('connection', new NetSocket());

        const disconnectionListener = vi.fn();
        server.on('disconnection', disconnectionListener);

        // Simula desconexão de cliente
        const netSocketInstance = vi.mocked(NetSocket).mock.results[0]!.value;
        netSocketInstance.emit('close');

        expect(disconnectionListener).toHaveBeenCalledWith(expect.any(Socket));
    });

    it('should handle and emit server errors', () => {

        const server = new Server(3000);
        server.start();

        const errorListener = vi.fn();
        server.on('error', errorListener);

        // Simula emissão de erro pelo servidor
        const error = new Error('Server error');
        const netServerInstance = vi.mocked(NetServer).mock.results[0]!.value;
        netServerInstance.emit('error', error);

        expect(errorListener).toHaveBeenCalledWith(error);
    });

    it('should emit listening event when server starts listening', () => {

        const server = new Server(3000);
        server.start();

        const listeningListener = vi.fn();
        server.on('listening', listeningListener);

        const netServerInstance = vi.mocked(NetServer).mock.results[0]!.value;
        netServerInstance.emit('listening');

        expect(listeningListener).toHaveBeenCalled();
    });

    it('should close all sockets and clear the sockets set on server close', () => {

        const server = new Server(3000);
        server.start();

        // Simula conexão de cliente
        const netServerInstance = vi.mocked(NetServer).mock.results[0]!.value;
        netServerInstance.emit('connection', new NetSocket());
        const netSocketInstance = vi.mocked(NetSocket).mock.results[0]!.value;

        server.close();

        expect(netServerInstance.close).toHaveBeenCalled();
        expect(netSocketInstance.end).toHaveBeenCalled();
    });

    it('should broadcast an event to all connected sockets', () => {

        const server = new Server(3000);
        server.start();

        // Simula conexão de clientes
        const netServerInstance = vi.mocked(NetServer).mock.results[0]!.value;
        netServerInstance.emit('connection', new NetSocket());
        netServerInstance.emit('connection', new NetSocket());

        // Pepara evento que será enviado
        const event: Event = { name: 'test-event', data: { args: ['arg1', 'arg2'] } };
        server.broadcast(event.name, event.data);
        const encodedEvent = EventStreamSerializer.encode(event);

        const netSocketInstance1 = vi.mocked(NetSocket).mock.results[0]!.value;
        const netSocketInstance2 = vi.mocked(NetSocket).mock.results[1]!.value;

        expect(netSocketInstance1.write).toHaveBeenCalledWith(encodedEvent);
        expect(netSocketInstance2.write).toHaveBeenCalledWith(encodedEvent);
    });
});
