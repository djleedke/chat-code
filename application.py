from flask import Flask, render_template
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')

def messageReceived(methods=['GET', 'POST']):
    print('message was received!!!')

@socketio.on('send message')
def receive_message(json, methods=['GET', 'POST']):
    print('Received my event: ' + str(json))
    socketio.emit('send to all', json, callback=messageReceived)

if __name__ == '__main__':
    socketio.run(app, debug=True)