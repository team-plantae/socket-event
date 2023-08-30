class EventStreamSerializer {

    static encode(event) {
        return `${Buffer.from(JSON.stringify(event)).toString('base64')}\n`;
    }

    static decode(event) {

        let buffer = Buffer.from(event, 'base64');

        try {
            return JSON.parse(buffer);
        }
        catch (e) {
            throw new Error(`Trucated event. Payload: ${event}, Decoded: ${buffer}.`);
        }
    }
}

module.exports = EventStreamSerializer;