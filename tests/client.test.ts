import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Client } from '../src/client';
import { Socket as NetSocket } from 'net';

vi.mock('net', async () => import('./mocks/net'));

describe('Client', () => {

    beforeEach(() => {
        vi.mocked(NetSocket).mockClear();
    });

    it('should connect to the given host and port', () => {
        const host = 'localhost';
        const port = 3000;

        new Client(host, port);

        const netSocketInstance = vi.mocked(NetSocket).mock.results[0]!.value;
        expect(netSocketInstance.connect).toHaveBeenCalledWith(port, host);
    });

    it('should inherit methods from Socket', () => {
        const host = 'localhost';
        const port = 3000;

        const client = new Client(host, port);

        expect(client).toHaveProperty('emit');
        expect(client).toHaveProperty('on');
    });
});
