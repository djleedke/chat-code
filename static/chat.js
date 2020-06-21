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

/* --------- Sending to Server ---------*/

//When our message form is submitted we send the message to the server
$('#message-form').submit(function(e){
    e.preventDefault();

    if($('#client-message').val().replace(/\s/g, '').length){
        //Message isn't only whitespace TO DO: Planning on moving input validation to the server
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

/*----------  Message Queue ----------*/

var nextMessage = true;

//The queue is checked every 1 second, waits for prior message to complete sending before starting another
setInterval(function(){
    
    if(messageQueue.length > 0 && nextMessage){             //If we have a message in the queue

        var message = messageQueue[0];                      //Getting the first one

        for(i = 0; i < message['message'].length; i++){     //Creating our characters

            let character = message['message'][i];
            createFallingCharacter(i, character, message);

        }

        createMessagePopup(message);                        //Make our popup message on the right

        nextMessage = false;                                //Will be false until final character has been created
        messageQueue.shift();                               //Removing that message from queue
    }
}, 1000);

//Creates our falling characters, if it's the last character sets the flag for a new message to true
function createFallingCharacter(pos, character, message){
    setTimeout(function() {

        console.log(message['messageID']);
        const char = new Character(character, message) 

        if(pos === message['message'].length - 1){
            nextMessage = true;
            console.log("ready for next");
        }

    }, pos * 500);
}

//Appends a message popup to our message container on the right side of screen
function createMessagePopup(message){

    $('#messages').append('<div class="message" id="' + message['messageID'] + '"> ' +
                                '<div class="message-username">[' + message['username'] + ']:</div></div>');

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

    //Starts our character moving until it reaches the bottom of the div
    moveCharacter(){

        this.setRandomX();

        var speed = 1.5;
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

    //Sets a random horizontal location for our letter to fall from
    setRandomX(){

        var areaWidth = $('#character-area').width(),
            charWidth = this.ele.clientWidth,
            widthMax = areaWidth - charWidth;
    
        var randomX = Math.floor(Math.random() * widthMax);
    
        this.ele.style.left = randomX + 'px';
    }
} 

/*--------- Key Handling --------- */

//Keypress logic
document.onkeydown = function(e){
    e = e || window.event;

    var keyPressString = String.fromCharCode(e.keyCode);
    
    if(!$('#client-message').is(':focus')){                //If we aren't focused in the form (not typing a message)
        
        if(e.keyCode === 13) {                             //If enter is pressed we give the message form focus again
                e.preventDefault();
                //$('#client-message').focus();
                toggleMessageForm();
        } else {                                              
                checkForCharacterRemoval(keyPressString);  //Otherwise checking whether the character should be removed
            }
    }
}

function checkForCharacterRemoval(keyPressString){

    var characterArea = document.getElementById('character-area');              //Our div where we want the elements to fall
    var currentCharacters = characterArea.querySelectorAll('[data-character]')  //List of current characters in that area
    
    outerloop:
    for(i = 0; i < currentCharacters.length; i++){  //Iterating our current characters

        if(currentCharacters[i].getAttribute('data-character').toUpperCase() === keyPressString) {  //If it matches the keyPress

            //Here we are getting the message element that the id matches along with its span element children
            var characterEle = currentCharacters[i];
            var messageEleSpans = document.getElementById(characterEle.getAttribute('data-message-id')).querySelectorAll('[data-character]');

            //Inside our span elements, is there a span that matches the character typed
            for(j = 0; j < messageEleSpans.length; j++){

                if(messageEleSpans[j].getAttribute('data-character').toUpperCase() === keyPressString && messageEleSpans[j].getAttribute('data-visible') === 'false'){
                   
                    //We've found a match, changing some CSS around and removing the falling element
                    messageCharacterFound(messageEleSpans[j]);
                    currentCharacters[i].remove();

                    break outerloop;    //We need to break out of both for loops, we only want one letter to be 'found' (in case it appears more than once)
                }
            }
        }
    }
}

//Sets the class CSS for our span element so the character will show
function messageCharacterFound(ele){

    ele.setAttribute('data-visible', true);
    ele.classList.remove('hidden');
    ele.classList.add('visible');

}

/* --------- On Click Events ----------*/

$('#submit').click(function(){
    toggleMessageForm();
});

function toggleMessageForm(){
    
    if($('#client-message').hasClass('extended')){
        $('#client-message').removeClass('extended');
        $('#client-message').addClass('retracted');
    } else {
        $('#client-message').removeClass('retracted');
        $('#client-message').addClass('extended');
        $('#client-message').focus();
    }
}