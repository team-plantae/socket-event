const { Server: NetServer } = require('net');
const Socket = require('./Socket');
const { EventEmitter } = require('events');

class Server extends EventEmitter {

    constructor(port) {
        super();
        this.port = port;
        this.sockets = [];

        this.init();
        this.listen();
    }

    init() {

        this.server = new NetServer();
    }

    close() {

        this.server.close();
    }

    listen() {

        this.server
            .on('connection', this.handleSocketConnection.bind(this))
            .on('error', this.handleSocketError.bind(this))
            .on('listening', this.handleSocketListening.bind(this))
            .listen(this.port);
    }

    broadcast(event, ...params){

        this.sockets.forEach(socket => socket.emit(event, ...params));
    }

    handleSocketConnection(socket) {

        let eventSocket = new Socket(socket);
        this.sockets.push(eventSocket);

        this.emit('connection', eventSocket);

        socket.on('close', () => this.handleSocketDisconnection(eventSocket));
    }

    handleSocketError(...args) {

        this.emit('error', ...args);
    }

    handleSocketListening(...args) {

        this.emit('listening', ...args);
    }

    handleSocketDisconnection(eventSocket) {

        let pos = this.sockets.indexOf(eventSocket);

        if (!!~pos) {
            this.sockets.splice(pos, 1);
        }

        this.emit('disconnection', eventSocket);
    }
}

module.exports = Server;