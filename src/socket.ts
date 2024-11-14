import { Socket as NetSocket } from 'net';
import { EventEmitter } from 'events';
import { EventStreamSerializer } from './event-stream-serializer';
import { Event } from './event';

export class Socket extends EventEmitter {
    protected socket: NetSocket;

    constructor(socket: NetSocket) {
        super();
        this.socket = socket;

        this.socket.on('data', this.handleData.bind(this));
        this.socket.on('error', this.handleError.bind(this));
        this.socket.on('close', this.handleClose.bind(this));
        this.socket.on('end', this.handleEnd.bind(this));
        this.socket.on('connect', this.handleConnect.bind(this));
    }

    public emit(eventName: string, ...args: any[]): boolean {
        const event: Event = { name: eventName, params: args };
        const message = EventStreamSerializer.encode(event);
        this.socket.write(message);
        return true;
    }

    public async disconnect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.socket.once('close', resolve);
            this.socket.once('error', reject);
            this.socket.end();
        });
    }

    public destroy(): void {
        this.socket.destroy();
    }

    protected handleData(data: Buffer) {
        const payloads = data.toString().split('\n').filter(Boolean);
        payloads.forEach(payload => {
            try {
                const event = EventStreamSerializer.decode(payload);
                super.emit(event.name, ...(event.params ?? []));
            } catch (error) {
                super.emit('error', error);
            }
        });
    }

    protected handleError(error: Error) {
        super.emit('error', error);
    }

    protected handleConnect() {
        super.emit('connect');
    }

    protected handleClose() {
        super.emit('close');
    }

    protected handleEnd() {
        super.emit('end');
    }
}
