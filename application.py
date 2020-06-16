from flask import Flask, render_template, redirect, url_for, request
from flask_socketio import SocketIO, join_room, leave_room

app = Flask(__name__)
socketio = SocketIO(app)

roomList = {}

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

@socketio.on('join_room')
def handle_join_room(data):
    app.logger.info("{} has joined the room {}".format(data['username'], data['room']))
    
    '''
    #Reminder code, we will eventually want to ensure that no more than 2 people
    #are in a room at once.  Will most likely create a RoomHandler class to keep track.
    if data['room'] in roomList:
        if roomList[data['room']] <= 1:
            roomList[data['room']] += roomList[data['room']] # should increment to 2
        else:
            print('room is full')
    else:
        roomList[data['room']] = 1

    print(roomList)
    data['user count'] = roomList[data['room']]
    '''

    join_room(data['room'])
    socketio.emit('update_users', data, room=data['room'])

@socketio.on('client_message')
def handle_client_message(data):
    print(data['message'])
    socketio.emit('client_message_receive', data, room=data['room'])


if __name__ == '__main__':
    socketio.run(app, debug=True)