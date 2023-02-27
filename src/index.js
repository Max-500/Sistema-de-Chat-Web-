//Este modulo es para los servidores
const http = require("http");
const express = require("express");

const rateLimit = require("express-rate-limit")

const limiter = rateLimit({
  windowsMs: 15 * 60 * 1000,
  max: 4,
  message: "Alcanzaste el limite"
})

//Se encarga de unir directorios
const path = require("path");

//socket.io es necesario para usar sockets y mantener conectado al cliente con el servidor
const socketio = require("socket.io");
const app = express();

//app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/public/css/main.css")));
//app.use(limiter)
const server = http.createServer(app);

const io = socketio(server);
app.get('/', limiter, (req, res)=>{
  res.sendFile(__dirname + '/public/index.html')
})

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
        let emisor = socketStorage.get(socket.nicknames);
        console.log(base64)
        const msg = base64.receptor;
        const img = base64.img;
        console.log("Soy msg: " + msg)
        console.log(msg)
        const cadena = msg.split(" ")
        console.log("-----")
        console.log(cadena)
        console.log("-----")
        const receptor = socketStorage.get(msg);
        console.log("-----")
        console.log("Soy el receptor" + receptor)
        console.log("-----")
        let message;
        if(cadena.length === 1){
            message = socket.nicknames + " -> " + " "
        }else{
            for(let i = 1; i < cadena.length; i++){
                message = message + " " + cadena[i]
            }
        }
        console.log("-----")
        console.log(message)
        console.log("-----")
        io.to(emisor).emit("new file private", {msg: message, img: img})
        io.to(receptor).emit("new file private", {msg: message, img: img})
    });

    socket.on("send file private - messagge", function (base64) {
        let emisor = socketStorage.get(socket.nicknames);
        const msg = base64.receptor;
        const img = base64.img;
        const cadena = msg.split(" ")
        const receptor = socketStorage.get(cadena[0]);
        io.to(emisor).emit("new file private - messagge", img)
        io.to(receptor).emit("new file private - messagge", img)
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
      //socketStorage.remove(socket.nicknames)
      io.sockets.emit("usernames", nicknames);
    });
  });
}

execute(io);
