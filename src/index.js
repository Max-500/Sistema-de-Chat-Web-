//Este modulo es para los servidores
const http = require('http');
const express = require('express');

//Se encarga de unir directorios
const path = require('path');

//socket.io es necesario para usar sockets y mantener conectado al cliente con el servidor
const socketio = require('socket.io');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);

const io = socketio(server);

require('./sockets')(io);

//Configurando el puerto
app.set('port', process.env.PORT || 3000)

server.listen(app.get('port'), () => {
    console.log('SERVER RUNNING IN the port:', app.get('port'));
})