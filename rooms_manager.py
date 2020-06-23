
import uuid

class RoomsManager:

    def __init__(self):
        print('Rooms Manager Initialized')
        self.rooms_list = []
        
    def join_or_create_room(self, room_name, username):

        exists = False

        for room in self.rooms_list:
            if room.name == room_name:
                exists = True
                room.add_user(username)

        if len(self.rooms_list) == 0 or exists == False:
            print('Rooms Manager: A new room has been created with name "' + room_name + '"')
            new_room = Room(room_name)
            self.rooms_list.append(new_room)
            new_room.add_user(username)

    def leave_room(self, room_name, username):

        for room in self.rooms_list:
            if room.name == room_name:
                if(room.remove_user(username)):
                    self.rooms_list.remove(room)
                    print('Rooms Manager: Room is empty, removing.')
                break


    def get_user_count_for_room(self, room_name):

        room = self.get_room(room_name)

        if(room):
            return room.get_user_count()
        else:
            return 0


    def get_room(self, room_name):

        room = None

        for r in self.rooms_list:
            if r.name == room_name:
                room = r

        return room

class Room:

    def __init__(self, name):
        self.users =[]
        self.name = name

    def add_user(self, username):

        if username in self.users:
            print('Room {}: {} user exists!'.format(self.name, username))

            return False
        else:
            self.users.append(username)
            print('Room {}: {} has joined the room.'.format(self.name, username))
            self.print_current_users()

            return True

    def remove_user(self, username):

        if username in self.users:
            self.users.remove(username)
            print('Room {}: {} has left the room.'.format(self.name, username))
            self.print_current_users()
            
        if len(self.users) == 0:
            return True #Room empty take it out of active room list

        return False

    def process_client_message(self, data):
        
        processed_data = data
        processed_data['messageID'] = uuid.uuid4().hex[:10]     #10 digit message id so messages are unique
        print('Room {}: {}: {}'.format(self.name, processed_data['username'], processed_data['message']))

        return processed_data

    def get_user_count(self):
        return len(self.users)

    def print_current_users(self):
        print('Room {}: Current Users: {}'.format(self.name, self.users))
