
import uuid

class RoomsManager:

    def __init__(self):
        print('Rooms Manager Initialized')
        self.rooms_list = []
        
    #Either joins an existing room or creates a new one if none exist w/ specified name   
    def join_or_create_room(self, room_name, username, sid):

        exists = False

        for room in self.rooms_list:
            if room.name == room_name:
                exists = True
                room.add_user(username,sid)

        if len(self.rooms_list) == 0 or exists == False:
            print('Rooms Manager: A new room has been created with name "' + room_name + '"')
            new_room = Room(room_name)
            self.rooms_list.append(new_room)
            new_room.add_user(username, sid)

    #Removes user with specified request id from room, returns string of room that user was in
    def leave_room(self, sid):

        for room in self.rooms_list:
            if sid in room.users:
                room.remove_user(sid)
                if(room.get_user_count() == 0):
                    self.rooms_list.remove(room)    
                    print('Rooms Manager: Room is empty, removing.')

                return room.name
        
        return False


    #returns users count for specified room
    def get_user_count_for_room(self, room_name):

        room = self.get_room(room_name)

        if(room):
            return room.get_user_count()
        else:
            return 0

    #returns the room object for the name specified
    def get_room(self, room_name):

        room = None

        for r in self.rooms_list:
            if r.name == room_name:
                room = r

        return room

class Room:

    def __init__(self, name):
        self.users = {}
        self.name = name

    #adds sid and user to users dictionary
    def add_user(self, username, sid):
        
        #TO DO: Need to add a check for whether or not name exists
        #print('Room {}: {} user exists!'.format(self.name, username))
        
        self.users[sid] = username
        print('Room {}: {} has joined the room.'.format(self.name, username))
        self.print_current_users()

        return True

    #removes user with specified request id from room
    def remove_user(self, sid):
            
        if sid in self.users.keys():
            print('Room {}: {} has left the room.'.format(self.name, self.users[sid]))
            del self.users[sid]
            self.print_current_users()

        return

    #processes a message from the client that was sent to this room
    def process_client_message(self, data):
        
        processed_data = data
        processed_data['messageID'] = uuid.uuid4().hex[:10]     #10 digit message id so messages are unique
        print('Room {}: {}: {}'.format(self.name, processed_data['username'], processed_data['message']))

        return processed_data

    #gets count of users dictionary
    def get_user_count(self):
        return len(self.users)

    #prints our list of currently connected users in console
    def print_current_users(self):
        print('Room {}: Current Users: {}'.format(self.name, self.users))
