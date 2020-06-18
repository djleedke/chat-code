import time

class RoomManager:

    users = []
    character_queue = []


    def __init__(self, name):
        self.name = name
        print('New room manager created for room: ' + name)

    def add_user(self, username):

        if username in self.users:
            print('user exists!')
            return False
        else:
            print(username + " has joined the room.")
            self.users.append(username)
            print(self.users)
            return True

'''
    def add_message_to_queue(self, message, user):

        character_list = [[user, char] for char in message]
        self.character_queue.extend(character_list)

    def start_queue(self, socketio):
        while self:
            
            if(len(self.character_queue) > 0):
                
                for char in self.character_queue:
                    print('sending ' + char[1])
                    time.sleep(2)
                    socketio.emit('server_message', char, room=self.name)
                    self.character_queue.remove(char)
                    print(self.character_queue)
            else:
                continue
            '''