const {Server: NetServer}   = require('net');
const Socket                = require('./Socket');
const { EventEmitter }      = require("events");


class Server extends EventEmitter{

    constructor(port){
        super();
        this.port = port;
        this.sockets = [];

        this.startServer();
        this.listen();
    }


    startServer(){

        this.server = new NetServer();
    }

    close(){
        this.server.close();
    }

    listen(){

        this.server.on('connection', socket => this.handleSocketConnection(socket));
        this.server.listen(this.port);
    }

    handleSocketConnection(socket){

        let eventSocket = new Socket(socket);
        this.sockets.push(eventSocket);

        this.emit('connection', eventSocket);

        socket.on('end', () => this.handleSocketDisconnection(eventSocket));
    }

    handleSocketDisconnection(eventSocket){

        var pos = this.sockets.indexOf(eventSocket);

        if(!!~pos){
            this.sockets.splice(pos, 1);
        }

        this.emit('disconnection', eventSocket);
    }
}

module.exports = Server;