# TCP Socket Event

Biblioteca que abstrai o conceito de eventos para a conexão de sockets tcp.


## Servidor

Para iniciar o servidor, basta instanciar a classe `EventSocketServer` informando a porta

```js

let server = new EventSocketServer(1337);

```


## Cliente

Para iniciar o cliente, basta instanciar a classe

```js

let client = new EventSocketClient('localhost', 1337);

```




## Recebendo e enviando eventos

Após a conexão entre cliente e servidor ser estabelecida é possível ouvir e emitir eventos

```js


server.on('socket.square', )

socket.on('square', (heigth, width) => {

    

});




```

### Enviando eventos do servidor

Para enviar eventos basta chamar o método `emit` de um socket

```js
socket.emit('size', 500, 800);
```