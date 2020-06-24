from flask import Flask, render_template, redirect, url_for, request
from flask_socketio import SocketIO, join_room, leave_room
from rooms_manager import RoomsManager
import logging

app = Flask(__name__)
socketio = SocketIO(app)

#Disabling logging in the console so I can debug in peace
log = logging.getLogger('werkzeug')
log.disabled = True
app.logger.disabled = True

rooms_manager = RoomsManager()
#print(socketio.async_mode)

@app.route('/')
def index():
    return render_template('index.html')

#On a successful connection 'join_room_success' is sent from client
@socketio.on('join_room')
def handle_join_room(data):
                                          
    if(rooms_manager.join_or_create_room(data['room'], data['username'], request.sid)):   #Adding room to our implemented room manager
        join_room(data['room'])                                                           #SocketIO room creation or joining    
        user_count = rooms_manager.get_user_count_for_room(data['room'])

        new_data = {
            'room-name': data['room'],
            'user-count': user_count,
        }

        socketio.emit('join_room_success', new_data, room=data['room'])
    else:
        socketio.emit('join_room_failure')

@socketio.on('leave_room')
def handle_leave_room(data):

    leave_room(data['room'])
    rooms_manager.leave_room(data['room'], request.sid)

    user_count = rooms_manager.get_user_count_for_room(data['room'])
    
    socketio.emit('update_user_count', user_count, room=data['room'])

#Receiving the message from the client
@socketio.on('client_message')
def handle_client_message(data):
    processed_data = rooms_manager.get_room(data['room']).process_client_message(data)  #Sending the message to the room for validation and to add a unique id
    socketio.emit('server_message', processed_data, room=processed_data['room'])        #Sending it back to the other connected clients

@socketio.on('disconnect')
def disconnect():

    room = rooms_manager.leave_room(request.sid)
    leave_room(room)

    user_count = rooms_manager.get_user_count_for_room(room)

    socketio.emit('update_user_count', user_count, room=room)


if __name__ == '__main__':
    socketio.run(app, host='10.0.0.149', port=8000)

