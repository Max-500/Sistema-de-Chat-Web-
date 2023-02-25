//Este modulo es para los servidores
const http = require("http");
const express = require("express");

//Se encarga de unir directorios
const path = require("path");

//socket.io es necesario para usar sockets y mantener conectado al cliente con el servidor
const socketio = require("socket.io");
const app = express();

app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app);

const io = socketio(server);

app.set("port", process.env.PORT || 3000);

server.listen(app.get("port"), () => {
  console.log("SERVER RUNNING IN the port:", app.get("port"));
});

function execute(io) {
  let nicknames = [];
  const socketStorage = new Map();
  io.on("connection", (socket) => {
    console.log("Nuevo usuario detectado");

    socket.on("send message", function (data) {
      console.log("entro");
      io.sockets.emit("new message", {
        nick: socket.nicknames,
        msg: data,
      });
    });

    socket.on("send message private", function (data) {
      const cadena = data;
      const primerEspacioEnBlanco = cadena.indexOf(" ");
      const receptorM = cadena.slice(0, primerEspacioEnBlanco);
      const message = cadena.slice(primerEspacioEnBlanco + 1);
      let receptor = socketStorage.get(receptorM);
      let emisor = socketStorage.get(socket.nicknames);
      io.to(emisor).emit("new message private", {
        nick: socket.nicknames,
        msg: message
      });
      io.to(receptor).emit("new message private", {
        nick: socket.nicknames,
        msg: message
      });
    });

    socket.on("send file private", function (base64) {
        
    });

    socket.on("send file", function (base64) {
      console.log("Send");
      console.log(base64);
      io.sockets.emit("new file", base64);
    });

    socket.on("new user", (data, cb) => {
      console.log(nicknames);
      if (nicknames.indexOf(data) !== -1) {
        cb(false);
      } else {
        cb(true);
        socket.nicknames = data;
        nicknames.push(socket.nicknames);
        socketStorage.set(socket.nicknames, socket.id);
        console.log(socket.nicknames);
        io.sockets.emit("usernames", nicknames);
      }
    });

    socket.on("disconnect", (data) => {
      console.log(data);
      if (!socket.nicknames) {
        return;
      }
      nicknames.splice(nicknames.indexOf(data), 1);
      io.sockets.emit("usernames", nicknames);
    });
  });
}

execute(io);
