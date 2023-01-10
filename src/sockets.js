module.exports = function(io){
    io.on('connection', socket =>{
        console.log("Nuevo usuario detectado")
    })
}