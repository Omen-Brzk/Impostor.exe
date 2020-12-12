const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter); 

module.exports = {
    test: function() {
        // test d'insertion de valeurs en DB locale
        db.set('other', ['users','sdf']).write();
        
        db.set('users', [
            {name:'bla', role:'player'},
            {name:'15', role:'player'},
            {name:'blablabla', role:'player'},
            {name:'blabla', role:'player'},
            {name:'blablablabla', role:'player'}
        ]).write();
           
        const users = db.get('users');
        console.log(users.value());

        users.remove(x => x.name === '15').write();
        console.log(users.value());
        users.push({name:'pushed', role: 'quedal'}).write();
        console.log(users.value());
    },
    
    createTournament: function(hash, date) {
        const tournamentId = 'test';
        console.log('tournament creating', tournamentId);
        
        let tournaments = db.get('tournaments');
        if(tournaments.value() === undefined) {
            db.set('tournaments', []).write();
            tournaments = db.get('tournaments');
        }

        console.log(tournaments.value());
        if(this.tournamentExists(tournamentId)) return;
        
        tournaments.push({id: tournamentId, date: date, players: ['test', 'test2']}).write();
        console.log(tournaments.value());
    },

    listTournaments: function(){
        return db.get('tournaments');
    },
    
    addUserToTournament: function(tournamentId, userId) {
        const tournaments = db.get('tournaments');
        const tournament = tournaments.find({id: tournamentId});
        const players = tournament.get('players');
        if(players.find(p => p === userId).value() !== undefined) {
            console.log('user already registered')
            return;
        } else {
            players.push(userId).write();
            console.log(players.value());
        }
    },

    removeUserFromTournament: function(tournamentId, userId) {
        const tournaments = db.get('tournaments');
        const tournament = tournaments.find({id: tournamentId});
        const players = tournament.get('players');
        if(players.find(p => p === userId).value() === undefined) {
            console.log('user not registered')
            return;
        } else {
            players.remove(p => p === userId).write();
            console.log(players.value());
        }
    },

    removeTournament: function(hash) {
        const tournamentId = 'test';
        console.log('tournament creating', tournamentId);
        
        let tournaments = db.get('tournaments');
        if(tournaments.value() === undefined) {
            db.set('tournaments', []).write();
            tournaments = db.get('tournaments');
        }

        console.log(tournaments.value());
        tournaments.push({tournamentId, date: date, players: ['test', 'test2']}).write();
        console.log(tournaments.value());
    },

    tournamentExists: function(tournamentId) {
        const tournaments = db.get('tournaments');
        const tournament = tournaments.find({id: tournamentId});
        return tournament.value() !== undefined;
    }
}