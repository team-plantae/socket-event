import { describe, it, expect, vi } from 'vitest';
import { Server } from '../src/server';
import { Client } from '../src/client';
import { Socket } from '../src/socket';

describe('Integration Tests for Server and Client', () => {

    it('should start the server and listen for connections', async () => {

        const server = new Server(3500);

        const check = new Promise(resolve => {
            server.on('listening', resolve);
        });

        server.start();

        await expect(check).resolves.toBeUndefined();
        server.close();
    });

    it('should allow client to connect to server', async () => {

        const server = new Server(3501);

        server.start();
        const client = new Client('localhost', 3501);

        const check = new Promise(resolve => {
            client.on('connect', resolve);
        });

        await expect(check).resolves.toBeUndefined();
        server.close();
    });

    it('should detect a client connection on the server', async () => {

        const server = new Server(3502);
        const check = new Promise(resolve => {
            server.on('connection', resolve);
        });
        server.start();

        new Client('localhost', 3502);

        await expect(check).resolves.toBeInstanceOf(Socket);
        server.close();
    });

    it('should allow client to send ping and receive pong from server', async () => {

        const server = new Server(3503);
        server.start();

        server.on('connection', (socket) => {
            socket.on('ping', () => socket.emit('pong'));
        });

        const client = new Client('localhost', 3503);

        const check = new Promise(resolve => {
            client.on('pong', resolve);
        });

        client.emit('ping');
        await expect(check).resolves.toBeUndefined();

        client.disconnect();
        server.close();
    });

    it('should broadcast a message to multiple clients', async () => {
        const server = new Server(3504);
        server.start();

        const broadcastMessage = 'Server broadcast message';

        const allClientsConnected = new Promise<void>((resolve) => {
            const connectedClients = new Set();
            server.on('connection', (socket) => {
                connectedClients.add(socket);
                if (connectedClients.size === 2) {
                    resolve();
                }
            });
        });

        // Conecta os clientes
        const client1 = new Client('localhost', 3504);
        const client2 = new Client('localhost', 3504);

        // Espera até que ambos os clientes estejam conectados
        await allClientsConnected;

        const check1 = new Promise((resolve) => {
            client1.on('broadcast', resolve);
        });
        const check2 = new Promise((resolve) => {
            client2.on('broadcast', resolve);
        });

        // Envia o broadcast após ambos os clientes estarem conectados
        server.broadcast('broadcast', broadcastMessage);

        // Verifica se ambos os clientes receberam a mensagem de broadcast correta
        await expect(check1).resolves.toBe(broadcastMessage);
        await expect(check2).resolves.toBe(broadcastMessage);

        // Desconecta os clientes e fecha o servidor
        client1.disconnect();
        client2.disconnect();
        server.close();
    });

    it('should allow client to disconnect from server', async () => {

        const server = new Server(3505);
        server.start();

        const client = new Client('localhost', 3505);

        const check = new Promise(resolve => {
            client.on('close', resolve);
        });

        client.disconnect();
        await expect(check).resolves.toBeUndefined();

        server.close();
    });

    it('should allow server to disconnect client', async () => {

        const server = new Server(3506);
        server.start();

        const client = new Client('localhost', 3506);

        const check = new Promise(resolve => {
            client.on('close', resolve);
        });

        const clientConnected = new Promise<void>(resolve => {
            server.on('connection', resolve);
        });

        await clientConnected;

        server.close();

        await expect(check).resolves.toBeUndefined();
    });

});