module.exports = {
    name: 'lobby',
    description: 'Create an personnal lobby with arguments provided',
    execute(message, args) {
        const commandUser = message.guild.members.cache.get(message.author.id);
        // moment is used for hours
        const moment = require('moment');
        const allowedTimeFormats = ['HH:mm'];
        const {gameChannel, logsChannel, crewmateRole, crewChannel} = require('../../bot.js');
        const { crewmateEmojiId } = require('../../config.json');
        const crewmateEmoji = message.guild.emojis.cache.get(crewmateEmojiId);
        const h = genHash();
        
        console.log('args ', args);
        
        var time = moment(args[0], allowedTimeFormats);
        console.log('HH:mm', time.format('HH:mm'), time.isValid());
        
        if (!args.length > 0 || !time.isValid()) {
            message.channel.send(`${message.author} cette commande doit être suivie d'une heure valide pour fonctionner (HH:mm)`);
            return;
        }
        
        commandUser.roles.add(crewmateRole);
        logsChannel.send(`${message.author} a ouvert un lobby,\n||(#**${h}**)||`);
        
        gameChannel.send(`||@here||\n\n📢  ${message.author} organise une game **Among Us** aujourd'hui à **${time.format('HH:mm')}** !
        \n\n ➡️  Pour participer : Merci de **réagir à ce message avec l'émote :  <:crewmate:${crewmateEmojiId}>  (sans quoi votre participation ne comptera pas) !!!**
        \n\n 🔷 Réagir avec cette emote vous donnera l'accès au rôle **${crewmateRole}** ainsi qu'au channel <#${crewChannel.id}> pour préparer votre game ! 
        \n\n 🔵 Vous aurez également accès au channels vocaux **Lobby 1 & 2 !**
        \n (⚠️ **Sans ce rôle vous ne pourrez pas vous connecter en vocal !** ⚠️)
        \n\n ⭕ *Pour vous **désinscrire** enlevez simplement votre réaction en bas de ce message en cliquant à nouveau sur celle-ci*
        \n\n ||# **${h}**||
        \n\n **Participants :**
        \n* ${message.author}
        `)
        .then(async msg => {
            await msg.react(crewmateEmoji);
        })
        console.log(args);
        console.log(h);
    }
};

function genHash() {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let h = "";
    let n = 24;
    for(let i = 0; i < n; i++) {
        h += chars[Math.floor(Math.random() * chars.length)];
    }
    return h;
};