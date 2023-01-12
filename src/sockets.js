module.exports = function (io) {
    io.on('connection', socket => {
        console.log("Nuevo usuario detectado")

        socket.on('send message', function (data){
            io.sockets.emit('new message', data)
        })
    })


}