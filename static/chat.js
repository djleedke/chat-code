var protocol = window.location.protocol;
var socket = io.connect(protocol + '//' + document.domain + ':' + location.port);

var messageQueue = [];
var room;
var username;
var connected = false;


//Initial connection event, will attempt to rejoin previous room if user & room name exist already
socket.on('connect', function(data){

    if(username !== undefined && room !== undefined){
        socket.emit('join_room', {
            username:username,
            room:room
        });
    }
});


/*--------- Welcome Overlay ----------*/

$('#overlay-form').submit(function(e){
    e.preventDefault();
    
    username = $('#overlay-username').val();
    room = $('#overlay-room-name').val();


    if($('#overlay-username').val().replace(/\s/g, '').length){//Username not blank
        
        //If room name is blank we go to the 'Public' room
        if(!$('#overlay-room-name').val().replace(/\s/g, '').length){
            room = 'Public';
        }

        socket.emit('join_room', {
            username: username,
            room: room
        });

        //toggleMessageForm();

    } else {//If username is blank
        $('#overlay-alert').css('display', 'block');
        $('#overlay-alert').text('Username cannot be blank.');
    };

});

/*--------- Receiving from Server ---------*/

//Receiving the message from the server and updating the html
socket.on('server_message', function(data){
        
    //var message = { messageID: data.messageID,  message: data.message }
    if(data.username !== username){ //We only want messages from other users
        messageQueue.push(data);
    } else {
        createMessagePopup(data, false);
    }

});

socket.on('join_room_success', function (data){
    connected = true;
    $('#welcome-overlay').addClass('hide-overlay');
    $('#username').text($('#overlay-username').val());
    $('#room-name').text(data['room-name']);
    $('#user-count').text(data['user-count']);
    toggleMessageForm();
});

socket.on('join_room_failure', function (data){
    $('#welcome-overlay').removeClass('hide-overlay');
    $('#overlay-alert').css('display', 'block');
    $('#overlay-alert').text('Username already in use.');
});

socket.on('update_user_count', function(data){
    $('#user-count').text(data);
});

/* --------- Sending to Server ---------*/

//When our message form is submitted we send the message to the server
$('#message-form').submit(function(e){
    e.preventDefault();


    if($('#client-message').val().replace(/\s/g, '').length){
        socket.emit('client_message', {
            username: username,
            room: room,
            message: $('#client-message').val()
        });

        $('#client-message').val('');
        $('#client-message').blur();
        //toggleMessageForm();
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

        createMessagePopup(message, true);                  //Make our popup message on the right

        nextMessage = false;                                //Will be false until final character has been created
        messageQueue.shift();                               //Removing that message from queue
    }
}, 1000);

//Creates our falling characters, if it's the last character it sets the flag for a new message to true
function createFallingCharacter(pos, character, message){
    setTimeout(function() {

        if(character !== ' '){
            const char = new Character(character, message) 
        }

        if(pos === message['message'].length - 1){
            nextMessage = true;
        }

    }, pos * 1000);
}

//Appends a message popup to our message container on the right side of screen
function createMessagePopup(message, encoded){

    var popup = document.createElement('div');

    popup.setAttribute('class', 'message');
    popup.setAttribute('id', message['messageID']);

    if(message['username'] === username){
        popup.classList.add('user-sent');
        popup.innerHTML = '<div class="message-username">[you]:</div></div>';
    } else {
        popup.innerHTML = '<div class="message-username">[' + message['username'] + ']:</div></div>';
    }

    $('#messages').append(popup);

    for(i = 0; i < message['message'].length; i++){

        if(message['message'][i] !== ' '){
            if(encoded === true){
                
                $('#' + message['messageID']).append('<span class="hidden" data-visible="false" data-character=' + message['message'][i] +'>#</span>');
            } else {
                $('#' + message['messageID']).append('<span class="hidden" data-visible="false" data-character=' + message['message'][i] +'>'+ message['message'][i] +'</span>');
            }
            
        } else {
            $('#' + message['messageID']).append('<span class="hidden" data-visible="false" data-character=' + message['message'][i] +'> </span>');
        }
    }

    startPopupTimer(popup);

}

function startPopupTimer(popup){
 
    setTimeout(function() {
        
        $(popup).fadeOut(10000, function(){
            popup.remove();
        });

    }, 30000);
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
        this.ele.onclick = function(){
            checkForCharacterRemoval(String(this.getAttribute('data-character')));
        }
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
        var headerHeight = $('header').height();
        

        var motionInterval = setInterval(function(){
            currentPos += speed;

            //Fixes some animation jumpiness on mobile
            if($(document).width() > 1000){
                elem.style.top = currentPos + headerHeight + "px"; 
            } else {
                elem.style.top = currentPos + "px"; 
            }

            var maxHeight = $('#character-area').height() - elem.clientHeight / 2;

            if(currentPos > maxHeight){
                elem.remove();
                clearInterval(motionInterval);
            }

        }, 20);

        var codeArray = ['0', this.character, '1', this.character];

        var codeEffectInterval = setInterval(function(){

            elem.innerHTML = codeArray[Math.floor(Math.random() * codeArray.length)];

        }, 300);
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

document.onkeypress = function(e){
    e = e || window.event;

    var keyPressString = String.fromCharCode(e.keyCode);
    
    if(!$('#client-message').is(':focus') && connected){                //If we aren't focused in the form (not typing a message)
        
        if(e.keyCode === 13) {                             //If enter is pressed we give the message form focus again

            e.preventDefault();
            toggleMessageForm();

        } else {                                              
                checkForCharacterRemoval(keyPressString);  //Otherwise checking whether the character should be removed
            }
    }

}

//Checks if the clicked/typed character needs to be removed
function checkForCharacterRemoval(keyPressString){
    
    keyPressString = keyPressString.toUpperCase();

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
    ele.innerHTML = ele.getAttribute('data-character');
    ele.classList.remove('hidden');
    ele.classList.add('visible');

}

/* --------- On Click Events ----------*/

$('#submit-message').click(function(){
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