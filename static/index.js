var socket = io.connect('http://' + document.domain + ':' + location.port);
       
socket.on('connect', function() {
    socket.emit('my event', {
      data: 'User Connected'
    })

    var form = $('form').on('submit', function(e) {
      
        e.preventDefault()
    
      let user_message = $('#send-message').val()

      socket.emit('send message', {
        message : user_message
      })
      $('#send-message').val('').focus()
    })
  })

socket.on('send to all', function( msg, callback ) {
    console.log(msg)
    $('#message-arena').append("<div>" + msg.message + "</div>");
    callback();
})