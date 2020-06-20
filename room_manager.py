
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