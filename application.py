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

    join_room(data['room'])                                             #SocketIO room creation or joining
    rooms_manager.join_or_create_room(data['room'], data['username'])   #Adding room to our implemented room manager
    
    socketio.emit('update_users', data, room=data['room'])

#Receiving the message from the client
@socketio.on('client_message')
def handle_client_message(data):
    processed_data = rooms_manager.get_room(data['room']).process_client_message(data)  #Sending the message to the room for validation and to add a unique id
    socketio.emit('server_message', processed_data, room=processed_data['room'])        #Sending it back to the other connected clients

@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')


if __name__ == '__main__':
    socketio.run(app, debug=True)
