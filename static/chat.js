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
        
    if(data.username !== username){ //We only want messages from other users
        messageQueue.push(data.message);
        console.log(messageQueue);
    }

});

/*----------  Message Queue ----------*/

setInterval(function(){
    
    var msg = messageQueue[0];

    if(messageQueue.length > 0){

        for(i = 0; i < msg.length; i++){

            let character = msg[i];

            setTimeout(function() {

                const char = new Character(character); 
                var j = i; 
    
            }, i * 2000);
        }

        messageQueue.shift();
        console.log(messageQueue);
    }
}, 1000);


/*---------- Classes ----------*/

class Character {

    constructor(character){
        this.character = character;
        this.ele = document.createElement('div');
        this.ele.innerHTML = character;
        this.ele.setAttribute('style', 'position:absolute');
        this.ele.setAttribute('class', 'letter');
        $('#letter-area').append(this.ele);
        this.moveCharacter();
    }

    moveCharacter(){

        this.getRandomX();

        var speed = 1;
        var currentPos = 0;
        var elem = this.ele;

        var motionInterval = setInterval(function(){
            currentPos += speed;
            elem.style.top = currentPos + "px";
            
            var maxHeight = $('#letter-area').height() - elem.clientHeight / 2;

            if(currentPos > maxHeight){
                elem.remove();
                clearInterval(motionInterval);
            }

        }, 20);
    }

    getRandomX(){

        var areaWidth = $('#letter-area').width(),
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

    socket.emit('client_message', {
        username: username,
        room: room,
        message: $('#client-message').val()
    });

    $('#client-message').val('');
});


/*--------- Key Handler --------- */

//Keypress logic
document.onkeydown = function(e){
    e = e || window.event;

    /*
    //Attack mode toggling
    if(e.ctrlKey && attackMode === false){
        setAttackMode(true);
    } else if(e.ctrlKey && attackMode === true){
        setAttackMode(false); 
    }

    //We are defending, letters will now be removed when typed
    if(attackMode === false){
        checkForLetterRemoval(e);
    }*/
}

/*--------- Helper Functions --------*/

//Checks if the specified letter was pressed if it exists removes it from the DOM
function checkForLetterRemoval(e){
    for(i = 0; i < letterQueue.length; i++){

        inputChar = String.fromCharCode(e.keyCode).toUpperCase();
        letterChar = letterQueue[i].innerHTML.toUpperCase();

        if(inputChar === letterChar){
            letterQueue[i].remove();
            letterQueue = letterQueue.filter(function(ele) { return ele !== letterQueue[i] });
            console.log(letterQueue);
            break;
        }
    }
}

//Determing random location inside message area to place our letters
function getRandomX(ele){

    var areaWidth = $('#letter-area').width(),
        letterWidth = ele.clientWidth,
        widthMax = areaWidth - letterWidth;

    var randomX = Math.floor(Math.random() * widthMax);

    return randomX;
}

