class EventDriven {

    constructor(){

        this.eventStack = [];
    }

    emit(event, ...data){

        if(!this.eventStack[event]) return;

        this.eventStack[event].forEach(cb => cb(...data));
    }


    on(event, cb){

        if(!this.eventStack[event]){
            this.eventStack[event] = [];
        }

        this.eventStack[event].push(cb);
        return this;
    }

    off(event, cb){

        var pos = this.eventStack[event].indexOf(cb);

        if(!~pos){
            this.eventStack[event].splice(pos, 1);
        }
    }
}

module.exports = EventDriven;