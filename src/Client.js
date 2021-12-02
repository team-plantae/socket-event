const {Socket: NetClient}   = require('net');
const Socket                = require('./Socket');


class Client extends Socket{

    constructor(host, port){
        super(new NetClient().connect(port, host));

        this.host = host;
        this.port = port;
    }
}

module.exports = Client;