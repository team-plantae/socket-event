class EventStreamSerializer{

    static encode(event){
        return `${Buffer.from(JSON.stringify(event)).toString('base64')}\n`;
    }

    static decode(event){
        return JSON.parse(Buffer.from(event, 'base64'));
    }
}

module.exports = EventStreamSerializer;