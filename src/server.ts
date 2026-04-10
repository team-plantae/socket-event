import { Server as NetServer, Socket as NetSocket } from 'net';
import { EventEmitter } from 'events';
import { Socket } from './socket';

export class Server extends EventEmitter {
    private readonly port: number;
    private readonly tcpServer: NetServer;
    private readonly clients: Set<Socket> = new Set();

    constructor(port: number) {
        super();
        this.port = port;
        this.tcpServer = new NetServer();
    }

    public start() {
        this.tcpServer
            .on('connection', (conn: NetSocket) => this.handleConnection(conn))
            .on('error', (error: Error) => this.emit('error', error))
            .on('listening', () => this.emit('listening'))
            .listen(this.port);
    }

    public close() {
        this.tcpServer.close();
        this.clients.forEach(client => client.disconnect());
        this.clients.clear();
    }

    public broadcast(event: string, data?: unknown) {
        this.clients.forEach(client => client.emit(event, data));
    }

    private handleConnection(connection: NetSocket) {
        const client = new Socket(connection);
        this.clients.add(client);
        this.emit('connection', client);
        connection.on('close', () => this.handleDisconnection(client));
    }

    private handleDisconnection(client: Socket) {
        this.clients.delete(client);
        this.emit('disconnection', client);
    }
}
