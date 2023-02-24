module.exports = function (io) {
    let nicknames = [];
    io.on('connection', socket => {
        console.log("Nuevo usuario detectado")

        socket.on('send message', function (data){
            io.sockets.emit('new message', {
                nick: socket.nicknames,
                msg: data,
            })
        })

        socket.on('send file', function (base64){
            console.log("Send file socket")
            console.log(base64)
            io.sockets.emit('new file', base64)
        })

        socket.on('new user', (data, cb)=>{
            if(nicknames.indexOf(data) !== -1){
                cb(false)
            }else{
                cb(true)
                socket.nicknames = data;
                nicknames.push(socket.nicknames);
                console.log(socket.nicknames)
                io.sockets.emit('usernames', nicknames);
            }
        })

        socket.on('disconnect', data => {
            console.log(data)
            if(!socket.nicknames){
                return;
            }
            nicknames.splice(nicknames.indexOf(data), 1);
            io.sockets.emit('usernames', nicknames);
        })

    })
}