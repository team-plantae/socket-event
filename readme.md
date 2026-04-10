# 🔌 @plantae-tech/socket-event

A lightweight library for event-driven communication over TCP sockets, enabling structured messaging between servers and clients using a familiar event-based API.

[![npm version](https://img.shields.io/npm/v/@plantae-tech/socket-event)](https://www.npmjs.com/package/@plantae-tech/socket-event)
[![license](https://img.shields.io/npm/l/@plantae-tech/socket-event)](https://github.com/team-plantae/socket-event/blob/master/LICENSE)

## Features

- Familiar `on` / `emit` API built on top of Node.js `EventEmitter`
- Base64-encoded JSON framing — works over any TCP stream
- Server broadcasts to all connected clients
- Automatic connection and disconnection tracking
- Zero runtime dependencies

## Installation

```bash
npm install @plantae-tech/socket-event
```

## Quick Start

### Server

```typescript
import { Server } from '@plantae-tech/socket-event';

const server = new Server(1337);

server.on('listening', () => {
    console.log('Server listening on port 1337');
});

server.on('connection', (client) => {
    console.log('Client connected');

    client.on('message', (text: string) => {
        console.log('Received:', text);
        client.emit('reply', `Echo: ${text}`);
    });
});

server.on('disconnection', (client) => {
    console.log('Client disconnected');
});

server.start();
```

### Client

```typescript
import { Client } from '@plantae-tech/socket-event';

const client = new Client('localhost', 1337);

client.on('connect', () => {
    console.log('Connected to server');
    client.emit('message', 'Hello!');
});

client.on('reply', (text: string) => {
    console.log('Server says:', text);
});

client.on('close', () => {
    console.log('Disconnected');
});
```

## Examples

### Broadcasting to all clients

```typescript
const server = new Server(1337);

server.on('connection', (client) => {
    client.on('chat', (message: { nickname: string; text: string }) => {
        // Forward to every connected client
        server.broadcast('chat', message);
    });
});

server.start();
```

### Sending structured data

Events can carry any JSON-serializable data:

```typescript
// Client sends an object
client.emit('player:move', { x: 10, y: 20, timestamp: Date.now() });

// Server receives it
socket.on('player:move', (data: { x: number; y: number; timestamp: number }) => {
    console.log(data.x, data.y, data.timestamp);
});
```

### Graceful shutdown

```typescript
process.on('SIGINT', () => {
    server.broadcast('shutdown', 'Server is shutting down');
    server.close(); // Disconnects all clients and closes the server
});
```

## API

### `Server`

| Method | Description |
|--------|-------------|
| `new Server(port)` | Create a server bound to `port` |
| `start()` | Start listening for connections |
| `close()` | Close the server and disconnect all clients |
| `broadcast(event, data?)` | Emit an event to every connected client |

**Events:** `listening`, `connection`, `disconnection`, `error`

### `Client`

| Method | Description |
|--------|-------------|
| `new Client(host, port)` | Connect to a server |
| `emit(event, data?)` | Send an event to the server |
| `disconnect()` | Gracefully close the connection (returns `Promise`) |
| `destroy()` | Immediately destroy the socket |

**Events:** `connect`, `close`, `end`, `error`, plus any custom events from the server

### `Socket`

Base class used by both `Client` and server-side client sockets. Extends `EventEmitter`.

## Protocol

Messages are framed as **newline-delimited Base64-encoded JSON**:

```
{"name":"event-name","data":{"key":"value"}}  →  base64  →  <base64>\n
```

Each line is one event. The receiver splits on `\n`, decodes each chunk from Base64, and parses the JSON to extract `name` and `data`.
