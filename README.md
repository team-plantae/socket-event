# TCP Socket Event

Biblioteca que abstrai o conceito de eventos para a conexão de sockets tcp.


## Servidor

Para iniciar o servidor, importe a classe `Server`, depois instancie ela informando uma porta onde as requisições serão ouvidas.

```js
const { Server } = require('socket-event');
let server = new Server(1337);
```

### Recebendo/Enviando eventos

Para ouvir eventos enviados pelo cliente, aguarde uma conexão usando o método `.on` na instância do `Server` ouvindo pelo evento `connection`, uma instância de `Socket` será retornado quando houver uma conexão.

A instância do `Socket` é a conexão com o cliente, então no callback é possível definir os eventos recebidos do cliente que serão ouvidos utilizando o método `.on`.

Para enviar eventos para o cliente, utilize o método `.emit` na instância do `Socket` com a conexão do cliente. O primeiro parâmetro do método `.emit` deverá conter o nome do evento que será recebido pelo cliente, os demais parâmetros serão parâmetros do evento.

```js
new Server(1337)
    .on('connection', socket => {
        socket.on('ping', (date) => socket.emit('pong', new Date() - new Date(date), new Date()))
    });
```


## Cliente

Para iniciar o cliente, importe a classe `Client`, depois instancie ela informando o ip do host e a porta onde as requisições serão ouvidas.

```js
const { Client } = require('socket-event');
let client = new Client('localhost', 1337);
```


### Recebendo/Enviando eventos

Para ouvir eventos enviados pelo servidor, utilize o método `.on` na instância do `Client`, o primeiro parâmetro será o nome do evento os demais parâmetros serão parâmetros do evento.

Para enviar eventos para o servidor, utilize o método `.emit` na instância do `Client`. O primeiro parâmetro do método `.emit` deverá conter o nome do evento que será recebido pelo servidor, os demais parâmetros serão parâmetros do evento.

```js
let client = new Client('localhost', 1337);
    .on('auth', () => client.emit('auth', 'token'));
```

## Conexão como primeiro parâmetro

TODO:
Analisar possibilidade de receber o socket de conexão como primeiro parâmetro de eventos, melhorando o lado do cliente que não precisaria de uma variável intermediária para responder o servidor.

Para manter o lado do cliente e do servidor consistentes, essa alteração deve ser feita no lado do servidor também.

```js
new Server(1337)
    .on('connection', socket => {
        socket.on('ping', (socket, date) => socket.emit('pong', new Date() - new Date(date), new Date()))
    });

new Client('localhost', 1337);
    .on('auth', socket => socket.emit('auth', 'token'));
```