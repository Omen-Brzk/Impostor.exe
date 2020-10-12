const Discord = require('discord.js');
const client = new Discord.Client();
const {prefix, token} = require('./auth.json');

//Initialize bot
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const validCommands = ['imposteur', 'lobby', 'gameover'];
    const crewmateEmoji = message.guild.emojis.cache.get('764152978957271060');
    

    if (command === 'imposteur') {
        return message.channel.send('Votez **<@257244637650092032>** \nIl est louche...');
    }

    else if (command === 'lobby') {

        const crewmateRole = message.guild.roles.cache.get('764968869973458947');
        const commandUser = message.guild.members.cache.get(message.author.id);
        const crewChannel = message.guild.channels.cache.get('765225922059042856');

        if (!args.length) {
            return message.channel.send(`${message.author} cette commande a besoin d'options pour fonctionner !`);
        }
        
        commandUser.roles.add(crewmateRole);

        message.channel.send(`||@everyone||\n\n📢  ${message.author} organise une game **Among Us** aujourd'hui à **${args[0]}h** !
        \n\n ➡️  Pour participer : Merci de **réagir à ce message avec l'émote :  <:crewmate:764152978957271060>  (sans quoi votre participation ne comptera pas) !!!**
        \n\n 🔷 Réagir avec cette emote vous donnera l'accès au rôle **${crewmateRole}** ainsi qu'au channel <#${crewChannel.id}> pour préparer votre game ! 
        \n\n 🔵 Vous aurez également accès au channels vocaux **Lobby 1 & 2 !**
        \n (⚠️ **Sans ce rôle vous ne pourrez pas vous connecter en vocal !** ⚠️)
        \n\n ⭕ *Pour vous **désinscrire** enlevez simplement votre réaction en bas de ce message*
        \n\n **Participants :**
        \n* ${message.author}
        `)
        .then(async msg => {
            await msg.react(crewmateEmoji);
        })
    }
    
    else if(command != validCommands) {
        return message.channel.send(`${message.author}, commande invalide ou inexsitante !`);
    };
});

//Adding roles on messageReactionAdd Event
client.on('messageReactionAdd', (reaction, user) => {
    const message = reaction.message;
    const crewmateRole = message.guild.roles.cache.get('764968869973458947');
    const msgUser = message.guild.members.cache.get(user.id);

    //add crewmate role on desired reaction
    if(reaction.emoji.name === 'crewmate' && !user.bot)
    {
        msgUser.roles.add(crewmateRole);
        console.log(`${msgUser} a rejoint le role ${crewmateRole.name}`);
        message.edit(message.content + `\n* ${msgUser}`);
    }
});

//Removing roles on messageReactionRemove Event
client.on('messageReactionRemove', (reaction, user) => {
    const message = reaction.message;
    const crewmateRole = message.guild.roles.cache.get('764968869973458947');
    const msgUser = message.guild.members.cache.get(user.id);

    //remove crewmate role on desired reaction
    if(reaction.emoji.name === 'crewmate' && !user.bot)
    {
        msgUser.roles.remove(crewmateRole);
        console.log(`${msgUser} a quitté le role ${crewmateRole.name}`);
        message.edit(message.content.replace(`\n* ${msgUser}`, ''));
    }
});

//Welcome message on guildMemberAdd event
client.on('guildMemberAdd', (member) => {
    member.guild.channels.cache.get('763437048450646036')
    .send('**<@' + member.id + '>** est sorti d\'une vent !! \nVotez le prochain buzz !');
});


//Bot login, code must be above this line.
client.login(token);