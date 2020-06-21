var socket = io.connect('http://' + document.domain + ':' + location.port);
var messageQueue = [];


/*--------- Receiving from Server ---------*/

//On connection we send username & room args from index
socket.on('connect', function() {
    socket.emit('join_room', {
        username: username,
        room: room
    });
});

//Receiving the message from the server and updating the html
socket.on('server_message', function(data){
        
    //var message = { messageID: data.messageID,  message: data.message }
    console.log(data);
    //if(data.username !== username){ //We only want messages from other users
        messageQueue.push(data);
    //}

});

/*----------  Message Queue ----------*/
// Every second an interval runs to check and see if any messages are waiting
// in the message queue.  If there are we use a timeout in the createFallingCharacters
// function to delay their appearance on the screen (every 2 seconds a character appears).  
// During this time our nextMessage bool is false to prevent the screen from being flooded 
// with letters and the messages getting mixed together.  Once the final letter of a message 
// is sent the if statement in the interval will allow another message to fire off.

var nextMessage = true;

setInterval(function(){
    
    if(messageQueue.length > 0 && nextMessage){ //If we have a message in the queue

        var message = messageQueue[0];
        //var msg = messageQueue[0]['message'];

        for(i = 0; i < message['message'].length; i++){

            let character = message['message'][i];

            createFallingCharacters(i, character, message);
        }

        createMessageBubble(message);

        nextMessage = false;
        messageQueue.shift();
    }
}, 1000);

function createFallingCharacters(pos, character, message){
    setTimeout(function() {

        console.log(message['messageID']);
        const char = new Character(character, message) 

        if(pos === message['message'].length - 1){
            nextMessage = true;
            console.log("ready for next");
        }

    }, i * 500);
}

function createMessageBubble(message){

    $('#messages').append('<div class="message" id="' + message['messageID'] + '"> ' +
                                '<div class="message-username">' + message['username'] + ':</div></div>');

    for(i = 0; i < message['message'].length; i++){

        $('#' + message['messageID']).append('<span class="hidden" data-visible="false" data-character=' + message['message'][i] +'>' + message['message'][i] +'</span>');

    }
    

}


/*---------- Classes ----------*/

class Character {

    constructor(character, message){
        //Creating the element and setting style
        this.character = character;
        this.ele = document.createElement('div');
        this.ele.innerHTML = character;
        this.ele.setAttribute('data-message-id', message['messageID']);
        this.ele.setAttribute('data-character', character);
        this.ele.setAttribute('style', 'position:absolute');
        this.ele.setAttribute('class', 'character');
        //Adding to DOM
        $('#character-area').append(this.ele);
        //Start it falling
        this.moveCharacter();
    }

    moveCharacter(){

        this.getRandomX();

        var speed = 2;
        var currentPos = 0;
        var elem = this.ele;

        var motionInterval = setInterval(function(){
            currentPos += speed;
            elem.style.top = currentPos + 50 + "px";
            
            var maxHeight = $('#character-area').height() - elem.clientHeight / 2;

            if(currentPos > maxHeight){
                elem.remove();
                clearInterval(motionInterval);
            }

        }, 20);
    }

    getRandomX(){

        var areaWidth = $('#character-area').width(),
            charWidth = this.ele.clientWidth,
            widthMax = areaWidth - charWidth;
    
        var randomX = Math.floor(Math.random() * widthMax);
    
        this.ele.style.left = randomX + 'px';
    }
} 

/* --------- Sending to Server ---------*/

//When our message form is submitted we send the message to the server
$('#message-form').submit(function(e){
    e.preventDefault();

    if($('#client-message').val().replace(/\s/g, '').length){
        //Message isn't only whitespace
        socket.emit('client_message', {
            username: username,
            room: room,
            message: $('#client-message').val()
        });

        $('#client-message').val('');
        $('#client-message').blur();
    } else {
        //Submitted only whitespace
        $('#client-message').val('');
        $('#client-message').blur();
    }
});


/*--------- Key Handler --------- */

//Keypress logic
document.onkeydown = function(event){
    event = event || window.event;

    var characterFound = false;
    var keyPress = String.fromCharCode(event.keyCode);
    
    if(!$('#client-message').is(':focus')){ //If we aren't focused in the form
        

        if(event.keyCode === 13) { //If enter is pressed we give the message form focus again
            event.preventDefault();
            $('#client-message').focus();
        } else {

            //TO DO: This all needs to be cleaned up and moved to a separate function
            var characterArea = document.getElementById('character-area');
            var currentCharacters = characterArea.querySelectorAll('[data-character]')
            
            outerloop:
            for(i = 0; i < currentCharacters.length; i++){
                    
                if(currentCharacters[i].getAttribute('data-character').toUpperCase() === keyPress) {

                    //Here we are first getting the message element that the id matches, and then 
                    //all of the span elements inside that message so we can figure out if the character was inside
                    var char = currentCharacters[i];
                    var messageEle = document.getElementById(char.getAttribute('data-message-id')).querySelectorAll('[data-character]');

                    //Inside our span elements is there a span that matches the character typed
                    for(j = 0; j < messageEle.length; j++){
                        console.log(messageEle[j].getAttribute('data-visible'));
                        if(messageEle[j].getAttribute('data-character').toUpperCase() === keyPress && messageEle[j].getAttribute('data-visible') === 'false'){
                            //We've found a match
                            messageEle[j].setAttribute('data-visible', true);
                            messageEle[j].classList.remove('hidden');
                            messageEle[j].classList.add('visible');
                            currentCharacters[i].remove();
                            break outerloop;
                        }
                    }
                }
            }
        }
    }
}

