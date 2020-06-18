from flask import Flask, render_template, redirect, url_for, request
from flask_socketio import SocketIO, join_room, leave_room
from game_controller import Game
import logging

app = Flask(__name__)
socketio = SocketIO(app)

#Disabling logging in the console so I can debug in peace
log = logging.getLogger('werkzeug')
log.disabled = True
app.logger.disabled = True

game_list = []

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

    join_room(data['room'])
    find_game(data['room'], data['username'])

    print("{} has joined room: {}".format(data['username'], data['room']))
    
    socketio.emit('update_users', data, room=data['room'])

@socketio.on('team_change')
def change_teams(data):
    game = get_game(data['room'])
    game.change_team(data['username'], data['team'])

@socketio.on('client_message')
def handle_client_message(data):
    print("Message received: " + data['message']),
    socketio.emit('client_message_receive', data, room=data['room'])

def find_game(room, username):
    
    #Checking to see if we have a game going already in the room 
    # if not we make a new one and add the player
    exists = False

    for game in game_list:
        if game.room == room:
            exists = True
            game.add_player(username)


    if len(game_list) == 0 or exists == False:
        print('Game did not exist creating game for room: ' + room)
        new_game = Game(room)
        game_list.append(new_game)
        new_game.add_player(username)

def get_game(room):
    for game in game_list:
        if game.room == room:
            return game #need to handle the error here no else return

if __name__ == '__main__':
    socketio.run(app, debug=True)



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