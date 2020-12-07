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
        users.push({name:'pushed', role: 'quedal'}).write().then(_ => console.log(users.value()));
        console.log(users.value());
    },
    
    createTournament: function(date) {
        const tournamentId = 'test';//this.genHash();
        console.log('tournament creating', tournamentId);
        // if(!db.get('tournaments'))
        db.set('tournaments', [{hash: this.genHash(), date: date, players: ['test', 'test2']}]).write();
        
        const tournaments = db.get('tournaments');
        tournaments.push({hash: tournamentId, date: new Date(), players: []}).write();
        console.log(tournaments.value());
    },
    
    addUserToTournament: function(tournamentHash, userId) {
        // const tournament = db.get('tournaments.hash', tournament);
        const tournaments = db.get('tournaments');
        const tournament = tournaments.find(t => t.hash === tournamentHash);
        console.log(tournament.value());
        tournament.players?.push(userId).write();
        console.log(tournament.value());
    },
    
    genHash: function() {
        const chars = 'abcdefghijklmnopqrstuvwxyz';
        let h = "";
        let n = 24;
        for(let i = 0; i < n; i++) {
            h += chars[Math.floor(Math.random() * chars.length)];
        }
        return h;
    }
}