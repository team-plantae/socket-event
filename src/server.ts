import { Server as NetServer, Socket as NetSocket } from 'net';
import { EventEmitter } from 'events';
import { Socket } from './socket';

export class Server extends EventEmitter {
    protected port: number;
    protected server: NetServer;
    protected sockets: Set<Socket> = new Set();

    constructor(port: number) {
        super();
        this.port = port;
        this.server = new NetServer();
    }

    public start() {
        this.server
            .on('connection', this.handleSocketConnection.bind(this))
            .on('error', this.handleSocketError.bind(this))
            .on('listening', this.handleSocketListening.bind(this))
            .listen(this.port);
    }

    public close() {
        this.server.close();
        this.sockets.forEach(socket => socket.destroy());
        this.sockets.clear();
    }

    public broadcast(event: string, ...params: any[]) {
        this.sockets.forEach(socket => socket.emit(event, ...params));
    }

    protected handleSocketConnection(socket: NetSocket) {

        const eventSocket = new Socket(socket);
        this.sockets.add(eventSocket);
        this.emit('connection', eventSocket);
        socket.on('close', () => this.handleSocketDisconnection(eventSocket));
    }

    protected handleSocketError(error: Error) {
        this.emit('error', error);
    }

    protected handleSocketListening() {
        this.emit('listening');
    }

    protected handleSocketDisconnection(eventSocket: Socket) {
        this.sockets.delete(eventSocket);
        this.emit('disconnection', eventSocket);
    }
}
