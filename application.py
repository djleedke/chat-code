from flask import Flask, render_template, redirect, url_for, request
from flask_socketio import SocketIO, join_room, leave_room
from room_manager import RoomManager
import logging
import time
import uuid

app = Flask(__name__)
socketio = SocketIO(app)

#Disabling logging in the console so I can debug in peace
log = logging.getLogger('werkzeug')
log.disabled = True
app.logger.disabled = True

room_list = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat')
def chat():
    username = request.args.get('username')
    room = request.args.get('room')

    if username and room:
        return render_template('chat.html', username=username, room=room)
    else:
        return redirect(url_for('index'))

#On a successful connection 'join_room' is sent from client
@socketio.on('join_room')
def handle_join_room(data):

    join_room(data['room'])
    join_room_manager(data['room'], data['username'])

    print("{} has joined room: {}".format(data['username'], data['room']))
    
    socketio.emit('update_users', data, room=data['room'])

#Receiving the message from the client
@socketio.on('client_message')
def handle_client_message(data):

    print("Message received: " + data['message']),
    data['messageID'] = uuid.uuid4().hex[:10]                   #10 digit message id so messages are unique
    socketio.emit('server_message', data, room=data['room'])    #Sending it back to the other connected clients


#Checking to see if we have a room going already 
#if not we make a new one and add the user    
def join_room_manager(room_name, username):
    
    exists = False

    for room in room_list:
        if room.name == room_name:
            exists = True
            room.add_user(username)

    if len(room_list) == 0 or exists == False:
        print('Room did not exist creating manager, for room: ' + room_name)
        new_room = RoomManager(room_name)
        room_list.append(new_room)
        new_room.add_user(username)

def get_room(room_name):

    for room in room_list:
        if room.name == room_name:
            return room
        else:
            return None

if __name__ == '__main__':
    socketio.run(app, debug=True)
