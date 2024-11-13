# 🔌 tcp-socket-event

A lightweight library for event-driven communication over TCP sockets, enabling structured messaging between servers and clients using a familiar event-based API.

[![npm version](https://img.shields.io/npm/v/tcp-socket-event)](https://www.npmjs.com/package/tcp-socket-event)
[![license](https://img.shields.io/npm/l/tcp-socket-event)](https://github.com/team-plantae/socket-event/blob/v2/LICENSE)

## 🚀 Installation

Install the library via npm:

```bash
npm install tcp-socket-event
```

## 📖 Usage

### Server

Create a TCP server, handle client connections, and broadcast messages to all connected clients.

```typescript
import { Server } from 'tcp-socket-event';

const server = new Server(1337);

// Start the server
server.start();

// Listen for new client connections
server.on('connection', (clientSocket) => {
    console.log('Client connected!');

    // Listen for events from the client
    clientSocket.on('message', (data) => console.log('Client says:', data));

    // Send a welcome message to the client
    clientSocket.emit('welcome', 'Hello, client!');
});

// Broadcast an event to all clients
server.broadcast('announcement', 'Server-wide message to all clients');

// Close the server and disconnect all clients
server.close();
```

### Client

Connect to the server, emit events, and listen for responses.

```typescript
import { Client } from 'tcp-socket-event';

const client = new Client('localhost', 1337);

// Listen for events from the server
client.on('welcome', (message) => console.log('Server says:', message));

// Send an event to the server
client.emit('message', 'Hello, server!');

// Disconnect
await client.disconnect();
```
