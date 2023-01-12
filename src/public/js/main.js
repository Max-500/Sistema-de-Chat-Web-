$(function () {
    const socket = io();

    const $messageForm = $('#message-form');
    const $messageBox = $('#message')
    const $chat = $('#chat')
    
    $messageForm.submit(e =>{
        e.preventDefault();
        console.log("Enviando Datos")
        socket.emit('send message', $messageBox.val())
        $messageBox.val('');
    })

    socket.on('new message', function(data){
        $chat.append(data + '<br/>');
    })
})