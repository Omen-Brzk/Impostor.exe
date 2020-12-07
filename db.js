const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter); 

module.exports = {
    test: function() {
        // test d'insertion de valeurs en DB locale
        db.set('users', [
            {name:'jonv11', role:'pussy'},
            {name:'15', role:'pussy'},
            {name:'jsdqonv11', role:'pussy'},
            {name:'jqsonv11', role:'pussy'},
            {name:'redule26', role:'pussy'}
        ]).write();
        db.set('other', ['users','sdf']).write();
        
        const users = db.get('users');
        console.log(users.value());
        users.remove(x => x.name === '15').write();
        console.log(users.value());
        users.push({name:'pushed', role: 'quedal'}).write();
    },

    createTournament: function() {
        const tournamentId = this.genHash();
        console.log('tournament creating', tournamentId);
        if(!db.get('tournaments'))
            db.set('tournaments', []);

        const tournaments = db.get('tournaments');
        tournaments.push({hash: tournamentId, date: new Date(), players: []}).write();
        console.log(tournaments);
    },

    addUserToTournament: function(tournamentHash, userId) {
        // const tournament = db.get('tournaments.hash', tournament);
        const tournaments = db.get('tournaments');
        // const tournament = tournaments.find({hash, date, players } => hash === tournamentHash);
        console.log(tournaments.value());
        // tournament.players.push(userId).write();
        // console.log(tournament.value());
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