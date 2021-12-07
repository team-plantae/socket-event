const EventStreamSerializer   = require('./EventStreamSerializer');
const Event                   = require('./Event');

class Socket{

    constructor(socket){

        this.eventStack = [];
        
        this.connection = socket;
        this.connection.setEncoding('utf8');

        this.handleSocketEvents();
    }

    handleSocketEvents(){

        this.connection.on('data', data => {
            this.dispatch('data', data);
            let event = EventStreamSerializer.decode(data);
            this.dispatch(event.name, ...event.params);
        });

        this.connection.on('connect', (...args) => {
            this.dispatch('connect', ...args);
        });

        this.connection.on('timeout', (...args) => {
            this.dispatch('timeout', ...args);
        });

        this.connection.on('error', (...args) => {
            this.dispatch('error', ...args);
        });

        this.connection.on('close', (...args) => {
            this.dispatch('close', ...args);
        });
    }

    dispatch(event, ...params){

        if(!this.eventStack[event]) return;
        this.eventStack[event].forEach(cb => cb(...params));
    }

    emit(event, ...params){

        let encodedEvent = EventStreamSerializer.encode(new Event(event, ...params));
        this.connection.write(encodedEvent);
        return this;
    }

    on(event, cb){

        if(!this.eventStack[event]){
            this.eventStack[event] = [];
        }

        this.eventStack[event].push(cb);
        return this;
    }

    once(event, cb){

        let fn = (...args) => {
            this.off(event, cb);
            cb(...args);
        }

        return this.on(event, fn);
    }

    off(event, cb){

        var pos = this.eventStack[event].indexOf(cb);

        if(!~pos){
            this.eventStack[event].splice(pos, 1);
        }
    }
}

module.exports = Socket;