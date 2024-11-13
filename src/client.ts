import { Socket as NetClient } from 'net';
import { Socket } from './socket';

export class Client extends Socket {

    constructor(host: string, port: number) {
        super(new NetClient().connect(port, host));
    }
}
