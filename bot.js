const Discord = require('discord.js');
const client = new Discord.Client();
const {prefix, token} = require('./auth.json');

//Initialize bot
client.on('ready', () => {
    const logsChan = client.channels.cache.get('764572804444061697');
    console.log(`Logged in as ${client.user.tag}!`);
    logsChan.send(`Bot connecté en tant que ${client.user.tag}`);
});

client.on('message', message => {
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const validCommands = ['imposteur', 'lobby', 'gameover', 'purge', 'help', 'i'];
    const logsChannel = message.guild.channels.cache.get('764572804444061697');

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    if (command === 'imposteur') {
        return message.channel.send('Votez **<@257244637650092032>** \nIl est louche...');
    }

    else if (command === 'i')
    {
        message.channel.send(`${message.author}, https://discord.gg/SKKsRNu`);
        return;
    }

    else if (command === 'help' || command === 'h') {
        const helpEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Liste des commandes :')
        .setThumbnail('https://cdn.discordapp.com/attachments/395859711825805317/765613380891312208/unnamed.png')
        .addFields(
            { name: '\u200B', value: '\u200B' },
            { name: '**!h** OU **!help**', value: 'Ouvre une fenêtre d\'aide avec les commandes disponibles.'},
            { name: '\u200B', value: '\u200B' },
            { name: '**!imposteur**', value: 'Envoie un message tagant un membre souvent imposteur 🔪'},
            { name: '\u200B', value: '\u200B' },
            { name: '**!i**', value: 'Vous envoie un message avec l\'invitation **unique** du serveur Discord.'},
            { name: '\u200B', value: '\u200B' },
            { name: '**!lobby (option)**', value: 'Crée un message dans <#763376836025122837> cliquable pour organiser et rejoindre un lobby.'},
            { name: '\u200B', value: '\u200B' }
        )
        .addField('⚠️Précisions pour la commande !lobby ⚠️\n\n', 'Concernant la commande **!lobby** elle attend une (option) pour fonctionner à savoir un horaire \n\nPar exemple : !lobby 22 créera un **lobby programmé pour 22h !**\n\nChaque personne voulant rejoindre votre lobby devra **réagir au message dans <#763376836025122837> avec l\'emote <:crewmate:764152978957271060>** pour obtenir le rôle **<@&764968869973458947>**. \n\nLes <@&764968869973458947> ont accès aux channels vocaux Lobby 1 & 2 ainsi qu\'au channel <#765225922059042856>, **sans ce rôle vous ne pourrez rejoindre le lobby !⚠️**', true)
        .addField('\u200B', '\u200B')
        .setFooter('Plusieurs commandes seront ajoutées/modifées dans le futur, si vous avez besoin d\'aide mp moi !')
        .setTimestamp();

        return message.channel.send(helpEmbed);
    }

    //Purge messages from channel, only for admins & mods
    else if (command === 'purge')
    {
        if (message.member.hasPermission("MANAGE_MESSAGES")) {

            const amount = parseInt(args[0]);

           if(!args.length)
           {
               return message.channel.send(`${message.author} cette commande a besoin d'options pour fonctionner !`);
           }
           
           if (isNaN(amount)) {
                return message.channel.send(`${message.author} l'option de cette fonction doit être un nombre.`);
           } else if (amount <= 1 || amount > 100) {
                return message.channel.send(`${message.author} l'option de cette fonction doit être un nombre entre 1 & 100.`);
           }

           message.channel.bulkDelete(amount, true).catch((err) => {
            console.error(err);
            message.channel.send(
                "Une erreur a empêché la suppresion des messages."
           );
        },
        logsChannel.send(`Clear effectué, ${amount} message(s) supprimés`)
        )}
        else {return message.channel.send(`${message.author}, Vous n'avez pas les droits pour cette commande.`)};
    }

    else if (command === 'gameover')
    {
        if(message.member.hasPermission('MANAGE_MESSAGES'))
        {
            // TODO Add function that deletes bot messages in #annonces-games channel

        message.guild.members.cache.forEach(member => {
            if(!member.roles.cache.find(t => t.id == '764968869973458947')) return;
            member.roles.remove('764968869973458947')
                .then(function() {
                console.log(`Removed role from user ${member.user.tag}!`);
                logsChannel.send(`Removed role from user ${member.user.tag}!`);
            });
        });
        }
        else {return message.channel.send(`${message.author}, Vous n'avez pas les droits pour cette commande.`)};
        
    }

    else if (command === 'lobby') {

        const crewmateRole = message.guild.roles.cache.get('764968869973458947');
        const commandUser = message.guild.members.cache.get(message.author.id);
        const crewChannel = message.guild.channels.cache.get('765225922059042856');
        const crewmateEmoji = message.guild.emojis.cache.get('764152978957271060');
        const gameChannel = message.guild.channels.cache.get('763376836025122837');

        if (!args.length) {
            return message.channel.send(`${message.author} cette commande a besoin d'options pour fonctionner !`);
        }
        
        commandUser.roles.add(crewmateRole);
        logsChannel.send(`${message.author} a ouvert un lobby`);

        gameChannel.send(`||@everyone||\n\n📢  ${message.author} organise une game **Among Us** aujourd'hui à **${args[0]}h** !
        \n\n ➡️  Pour participer : Merci de **réagir à ce message avec l'émote :  <:crewmate:764152978957271060>  (sans quoi votre participation ne comptera pas) !!!**
        \n\n 🔷 Réagir avec cette emote vous donnera l'accès au rôle **${crewmateRole}** ainsi qu'au channel <#${crewChannel.id}> pour préparer votre game ! 
        \n\n 🔵 Vous aurez également accès au channels vocaux **Lobby 1 & 2 !**
        \n (⚠️ **Sans ce rôle vous ne pourrez pas vous connecter en vocal !** ⚠️)
        \n\n ⭕ *Pour vous **désinscrire** enlevez simplement votre réaction en bas de ce message en cliquant à nouveau sur celle-ci*
        \n\n **Participants :**
        \n* ${message.author}
        `)
        .then(async msg => {
            await msg.react(crewmateEmoji);
        })
    }
    
    else if(command != validCommands || !command) {
        return message.channel.send(`${message.author}, commande invalide ou inexsitante ! \n Tapez !help pour une assistance.`);
    };
});

//Adding roles on messageReactionAdd Event
client.on('messageReactionAdd', (reaction, user) => {
    const message = reaction.message;
    const crewmateRole = message.guild.roles.cache.get('764968869973458947');
    const msgUser = message.guild.members.cache.get(user.id);
    const logsChannel = message.guild.channels.cache.get('764572804444061697');
    const gameChannel = message.guild.channels.cache.get('763376836025122837');

    //add crewmate role on desired reaction
    if(reaction.emoji.name === 'crewmate' && !user.bot && message.channel.id === gameChannel.id)
    {
        msgUser.roles.add(crewmateRole);
        console.log(`${msgUser} a rejoint le role ${crewmateRole.name}`);
        logsChannel.send(`${msgUser} a rejoint le role ${crewmateRole.name}`);
        message.edit(message.content + `\n* ${msgUser}`);
    }
});

//Removing roles on messageReactionRemove Event
client.on('messageReactionRemove', (reaction, user) => {
    const message = reaction.message;
    const crewmateRole = message.guild.roles.cache.get('764968869973458947');
    const msgUser = message.guild.members.cache.get(user.id);
    const logsChannel = message.guild.channels.cache.get('764572804444061697');
    const gameChannel = message.guild.channels.cache.get('763376836025122837');

    //remove crewmate role on desired reaction
    if(reaction.emoji.name === 'crewmate' && !user.bot && message.channel.id === gameChannel.id)
    {
        msgUser.roles.remove(crewmateRole);
        console.log(`${msgUser} a quitté le role ${crewmateRole.name}`);
        logsChannel.send(`${msgUser} a quitté le role ${crewmateRole.name}`);
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