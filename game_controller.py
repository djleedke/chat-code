class Game:

    players = {}
    red_team_queue = []
    blue_team_queue = []


    def __init__(self, room):
        self.room = room

        print('New game created for room: ' + room)

    def add_player(self, username):
        if 'spectators' in self.players:
            self.players['spectators'].append(username)
        else:
            self.players['spectators'] = [username]

    def change_team(self, username, team):
        if team == 'red':
            print('red') #need to switch teams in players dictionary

        if team == 'blue':
            print('blue') #need to switch teams in players dictionary

        if team == 'spectator':
            print('spectator') #need to switch teams in players dictionary


'''
    def change_team(player, team_color):
        if team_color == 'spectator':
            players['spectator'].append(player)
            print(players); 

    def add_player_to_team(player, team_color):
        #add player to team
        return

    def remove_player_from_team(player, team_color):
        #removes player from team
        return

'''