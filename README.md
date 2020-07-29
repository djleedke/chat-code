## ChatCode
ChatCode is a Flask application that utilizes SocketIO to allow users to chat.  Messages must be "decoded" by recipients in order to read them (by typing in the letters). After which they are displayed temporarily and then disappear into the internet void, never to be seen again. Users can chat in a public room or specify a room name of their own for privacy. The app is deployed on Heroku and can be found at https://chat-code-app.herokuapp.com/.  Also, if you're interested in the inner workings of the app, I put together a short blog post that explains a few things [here](https://www.code-deejay.com/introducing-chat-code/).

![chat-code](https://user-images.githubusercontent.com/33850990/88751848-1f258c80-d11e-11ea-8e2d-0ee1dc42bed7.gif)

- [Setup](#setup)
- [Built With](#built-with)
- [Acknowledgements](#acknowledgements)

### Setup
If you'd like to get the project running locally start by setting up .git in a new folder:
```
git init
```

Pull the repo into the folder:
```
git pull https://github.com/djleedke/chat-code-app.git
```

Install virtualenv if you don't have it already and set up the environment (in the root folder still): 
```
pip install virtualenv
```
```
python -m virtualenv venv
```

Activate the virtual environment:
```
venv\scripts\activate
```

Now install the requirements.txt packages:
```
pip install -r requirements.txt
```

Set your FLASK_APP environment variable (for Windows):
```
set FLASK_APP=application.py
```

Now run the app:
```
flask run
```

...and that should do it!  You can send messages to and from yourself by opening multiple tabs in the browser.  The user sending the message does not need to decode their own so you will most likely want at least two tabs to get the full effect.  

One other item to be aware of is that when the app is running on the development server there will be a slight delay (20 seconds or so) on disconnect before the number of users is updated. This is remedied in the deployed version by utilizing [eventlet](http://eventlet.net/) which you will see in the Procfile.  Have fun!

### Built With

- [Flask](https://flask.palletsprojects.com/en/1.1.x/) - for the webserver
- [Flask-SocketIO](https://flask-socketio.readthedocs.io/en/latest/) - for the real-time chat

### Acknowledgements

The "fleeting chat message" idea was inspired by [Quibbler](http://quibbler.co/), check it out! 
