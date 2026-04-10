import { Socket as NetSocket } from 'net';
import { EventEmitter } from 'events';
import { EventStreamSerializer } from './event-stream-serializer';
import { LineEventDecoder } from './line-event-decoder';

export class Socket extends EventEmitter {
    protected connection: NetSocket;
    private decoder!: LineEventDecoder;

    constructor(connection: NetSocket) {
        super();
        this.connection = connection;
        this.setupPipeline();
        this.setupListeners();
    }

    public emit(event: string, data?: unknown): boolean {
        const encoded = EventStreamSerializer.encode({ name: event, data });
        this.connection.write(encoded);
        return true;
    }

    public disconnect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection.once('close', resolve);
            this.connection.once('error', reject);
            this.connection.end();
        });
    }

    public destroy(): void {
        this.connection.destroy();
    }

    private setupPipeline() {
        this.decoder = new LineEventDecoder();
        this.connection.pipe(this.decoder);
    }

    private setupListeners() {
        this.decoder.on('data', (frame: Buffer) => this.handleDecodedEvent(frame.toString()));
        this.connection.on('connect', () => super.emit('connect'));
        this.connection.on('close', () => super.emit('close'));
        this.connection.on('end', () => super.emit('end'));
        this.connection.on('error', (error: Error) => super.emit('error', error));
    }

    private handleDecodedEvent(payload: string) {
        try {
            const event = EventStreamSerializer.decode(payload);
            super.emit(event.name, event.data);
        } catch (error) {
            super.emit('error', error);
        }
    }
}
