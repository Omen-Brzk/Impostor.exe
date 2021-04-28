module.exports = {
    name: 'gameover',
    description: 'Delete lobby with provided ID as argument',
    permissions: 'MANAGE_MESSAGES',
    execute(message, args) {

        const { gameChannel, logsChannel } = require('../../bot.js');
        const { crewmateRoleId} = require('../../config.json');


        if(args.length > 0){
            if(args[0].length < 24) {
                return message.channel.send(`${message.author}, id de partie invalide ou inexistant.`);
            }
            
            else if(args[0].length === 24)
            {
                gameChannel.messages.fetch().then(msg => {
                    let msgDel = msg.filter(msg => msg.content.includes(args));
                    console.log(msgDel);
                    if(!msgDel.find(m => m.id)) {
                        return message.channel.send(`${message.author}, id de partie invalide ou inexistant.`);
                    }
                    gameChannel.bulkDelete(msgDel);
                    logsChannel.send(`Partie ||#**${args[0]}**|| supprimée par ${message.author}`);
                    message.guild.members.cache.forEach(member => {
                        if(!member.roles.cache.find(t => t.id == crewmateRoleId)) return;
                        member.roles.remove(crewmateRoleId)
                        .then(function() {
                            console.log(`Removed role from user ${member.user.tag}!`);
                            logsChannel.send(`Removed role from user ${member.user.tag}!`);
                        });
                    });
                });
                console.log(args[0]);
            }
        }
        else {return message.channel.send(`${message.author}, commande invalide`)};   
    }
}; 