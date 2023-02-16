const {Server: NetServer}   = require('net');
const Socket                = require('./Socket');
const { EventEmitter }      = require('events');
const Log                   = require('electron-log');

class Server extends EventEmitter{

    constructor(port){
        super();

        this.shouldLog = false;
        this.port = port;
        this.sockets = [];

        this.prepareLog();
        this.startServer();
        this.listen();
    }

    prepareLog(){

        Log.transports.file.resolvePathFn = () => `${__dirname}/socket-event.log`;
        this.handleDataLog = this.handleDataLog.bind(this);
    }

    startServer(){

        this.server = new NetServer();
    }

    close(){

        this.server.close();
    }

    listen(){

        this.server
            .on('connection', this.handleSocketConnection.bind(this))
            .on('error', this.handleSocketError.bind(this))
            .on('listening', this.handleSocketListening.bind(this))
            .listen(this.port);
    }

    handleSocketConnection(socket){

        let eventSocket = new Socket(socket);

        if(this.shouldLog)
            eventSocket.on('data', this.handleDataLog);

        this.sockets.push(eventSocket);

        this.emit('connection', eventSocket);

        socket.on('close', () => this.handleSocketDisconnection(eventSocket));
    }

    handleSocketError(...args){

        this.emit('error', ...args);
    }

    handleSocketListening(...args){

        this.emit('listening', ...args);
    }

    handleSocketDisconnection(eventSocket){

        let pos = this.sockets.indexOf(eventSocket);

        if(!!~pos){
            this.sockets.splice(pos, 1);
        }

        this.emit('disconnection', eventSocket);
    }

    handleDataLog(socket, message){
        Log.info(`[${socket.remoteAddress}]: ${message}`);
    }

    enableLog(){

        this.sockets.forEach(socket => socket.on('data', this.handleDataLog));
        this.shouldLog = true;
    }

    disableLog(){

        this.sockets.forEach(socket => socket.off('data', this.handleDataLog));
        this.shouldLog = false;
    }
}

module.exports = Server;