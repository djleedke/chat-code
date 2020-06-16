var socket = io.connect('http://' + document.domain + ':' + location.port);

//On connection we send username & room args from index
socket.on('connect', function() {
    socket.emit('join_room', {
        username: username,
        room: room
    });
});

//When our message form is submitted we send the message to the server
$('#message-form').submit(function(e){
    e.preventDefault();

    socket.emit('client_message', {
        username: username,
        room: room,
        message: $('#client-message').val()
    });

    $('#client-message').val('');
});

//Receiving the message from the server and updating the html
socket.on('client_message_receive', function(data){
    $('#messages').append('<div><b>' + data.username + ":</b> " + data.message + '</div>');
});