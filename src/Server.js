const {Server: NetServer}   = require('net');
const Socket                = require('./Socket');
const EventDriven           = require('./EventDriven');


class Server{

    constructor(port){
        this.port = port;
        this.sockets = [];
        this.eventHandler = new EventDriven();

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

        this.eventHandler.emit('connection', eventSocket);

        socket.on('end', () => this.handleSocketDisconnect(eventSocket));
    }

    handleSocketDisconnection(eventSocket){

        var pos = this.sockets.indexOf(eventSocket);

        if(!~pos){
            this.sockets.splice(pos, 1);
        }

        this.eventHandler.emit('disconnection', eventSocket);
    }

    on(...args){
        this.eventHandler.on(...args);
        return this;
    }
}

module.exports = Server;