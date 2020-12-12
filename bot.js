const db = require('./db.js')

const Discord = require('discord.js');
const { Client, Intents } = require("discord.js");
const intents = new Intents([
    Intents.NON_PRIVILEGED, // include all non-privileged intents, would be better to specify which ones you actually need
    "GUILD_MEMBERS", // lets you request guild members (i.e. fixes the issue)
]);

const client = new Client({ ws: { intents }, partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const { prefix,
        token,
        serverId,
        pickupRoleId,
        crewmateRoleId,
        modoRoleId,
        logsChannelId,
        infoChannelId,
        crewChannelId,
        gameChannelId,
        botChannelId,
        generalChannelId,
        crewmateEmojiId } = require('./config.json');



// moment is used for hours
const moment = require('moment');
const allowedTimeFormats = ['HH:mm'];

const allowedLobbyTypes = ['chill', 'intermediate'];

let server = undefined;
let pickupRole = undefined;
let crewmateRole = undefined;
let modoRole = undefined;
let logsChannel = undefined;
let infoChannel = undefined;
let generalChannel = undefined;
let crewChannel = undefined;
let gameChannel = undefined;
let fetchedMembers = [];

const getMember = (id) => {
    return new Promise((resolve, reject) => {
        try{
            if (fetchedMembers.find(u => u.id === id) === undefined) {
                server.members.fetch().then((members) => {
                fetchedMembers = members;
                resolve(fetchedMembers.find(u => u.id === id));
            })} else {
                resolve(fetchedMembers.find(u => u.id === id));
            };
        } catch {
            console.log('user not found : ' + id);
            logsChannel.send('user not found : ' + id);
            reject('user not found : ' + id);
        }
    });
  }

//Initialize bot
client.on('ready', () => {
    server = client.guilds.cache.get(serverId);
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(server);

    // Caching all members on Bot init (->bug on reactions to messages with inactives users)
    server.members.fetch().then((members) => {
        fetchedMembers = members;
        console.log(fetchedMembers.size + ' members found');
        //logsChannel.send(`⭕ **${members.size}** membres mis en cache.\n✅ **FIN** de la mise en cache des membres sur **${server}**`)
    });
    
    pickupRole = server.roles.cache.get(pickupRoleId);
    console.log('pickup role found :', pickupRole)

    crewmateRole = server.roles.cache.get(crewmateRoleId);
    console.log('crewmate role found :', crewmateRole)

    modoRole = server.roles.cache.get(modoRoleId);
    console.log('modérateur role found :', modoRole)

    logsChannel = server.channels.cache.get(logsChannelId);
    console.log('logs channel found :', logsChannel)

    infoChannel = server.channels.cache.get(infoChannelId);
    console.log('info channel found :', infoChannel)

    generalChannel = server.channels.cache.get(generalChannelId);
    console.log('general channel found :', generalChannel)

    crewChannel = server.channels.cache.get(crewChannelId);
    console.log('crew channel found :', crewChannel)
    
    gameChannel = server.channels.cache.get(gameChannelId);
    console.log('game channel found :', crewmateRole);
});

client.on('message', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const validCommands = ['test', 'i', 'invite', 'h', 'help', 'purge', 'gameover', 'lobby', 'pickup'];
    
    //Discord invite command
    if(validCommands.indexOf(command) < 0 || !command) {
        message.channel.send(`${message.author}, commande invalide ou inexistante ! => <#${infoChannelId}> pour une assistance.`);
        return;
    }
    else if (command === 'test')
    {
        if(!message.member.roles.cache.has(modoRoleId)) return;

        const action = args[0];
        const hash = args[1];
        const userId = args[2];

        if(action === 'create') {
            db.createTournament(hash, new Date());
        }

        if(!db.tournamentExists(hash))
        {
            console.log('tournament not found');
            const tournaments = db.listTournaments();
            const ids = tournaments.value().map(t => t.id);
            let listIds = '';
            ids.forEach(element => {
                listIds += element + '|';
            });
            message.channel.send('tournaments : ' + listIds);
            return;
        }

        const userToAdd = getUserFromArgs(userId.substr(3,18));
        if(!userToAdd) {
            message.channel.send('User' + userId + ' Not Found : ');
            return;
        }

        // TODO : add to tournament
        console.log('TODO');
        if(action === 'add') {
            db.addUserToTournament(hash, userToAdd.nickname);
        }

        if(action === 'remove') {
            db.removeUserFromTournament(hash, userToAdd.nickname);
        }
    }
    else if (command === 'i' || command === 'invite')
    {
        //message.channel.send(`${message.author}, https://discord.gg/SKKsRNu`);

        let invite = await message.channel.createInvite(
            {
              maxAge: 24 * 60 * 60, // 24h
              maxUses: 1 // maximum times it can be used
            },
            `Requested with command by ${message.author.tag}`
          )
          .catch(console.log);
          
        message.reply(invite ? `Here's your invite: ${invite}` : `Sorry${message.author} there has been an error during the creation of the invite.`);
        return;
    }
    //help command
    else if (command === 'help' || command === 'h')
    {
        const helpLobby = `- **horaire** (obligatoire)\n` + 
        `Formats acceptés : HH (ex: 21) | HH:mm (ex: 21:30) | HHhmm (ex: 21h30)\n\n` + 
        `- **mode** (non-obligatoire, si non précisé => chill)\n` + 
        `Les modes acceptés sont : chill | intermediate\n` + 
        `Le mode définit le niveau de la partie, merci de le respecter\n\n` + 
        `⚠️Chaque personne voulant rejoindre votre lobby devra **réagir au message dans <#${gameChannelId}> avec l\'emote <:crewmate:${crewmateEmojiId}>** pour obtenir le rôle **<@&${crewmateRoleId}>** (sans ce rôle vous ne pourrez rejoindre de lobby !) ⚠️` ;

        const helpPickup = `vous pouvez ajouter 'r' OU 'remove', cela vous retirera le rôle ${pickupRole}`;

        const helpEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Liste des commandes :')
        .setThumbnail('https://cdn.discordapp.com/attachments/395859711825805317/765613380891312208/unnamed.png')
        .addFields(
            { name: '**!h** OU **!help**', value: 'Ouvre une fenêtre d\'aide avec les commandes disponibles.'},
            { name: '\u200B', value: '----' }
        )
        .addFields(
            { name: '**!i**  OU **!invite**', value: 'Vous envoie un message avec l\'invitation **unique** du serveur Discord.'},
            { name: '\u200B', value: '----' }
        )
        .addFields(
            { name: '**!pickup** (option)', value: `Vous donnera le rôle ${pickupRole}, celui-ci vous permettra d'être notifié lorsqu'une place se libère. Uniquement disponible lorsqu'une (ou plusieures) game(s) est/sont crée(s).`},
            { name: '(option)', value: helpPickup },
            { name: '\u200B', value: '----' },
        )
        .addFields(
            { name: `**!lobby** (options)`, value: `Crée un message dans <#${gameChannelId}> cliquable pour organiser et rejoindre un lobby.`},
            { name: `(options) :`, value: helpLobby}
        )
        .addField('\u200B', `---- \nSi vous avez besoin d\'aide MP => <@&${modoRoleId}>`)
        .setFooter(`N'hésitez pas à remonter vos idées d'amélioration aux modérateurs ou a RN`)
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
    // Clean command for all crewmates members & lobby's message after a game
    else if (command === 'gameover')
    {
        if(message.member.hasPermission('MANAGE_MESSAGES'))
        {
            console.log(args);
            if(args.length > 0)
            {
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
        else {return message.channel.send(`${message.author}, Vous n'avez pas les droits pour cette commande.`)};
    }     
    else if (command === 'lobby') 
    {
        const commandUser = message.guild.members.cache.get(message.author.id);
        
        let crewmateEmoji = message.guild.emojis.cache.get(crewmateEmojiId);

        /// Oniii's hack
        if(!crewmateEmoji) {
            crewmateEmoji = '✅';
            console.log(crewmateEmoji);

            crewmateEmoji = client.emojis.cache.find(e => e.name === 'muscle');
            console.log('emoji fallback : ', crewmateEmoji);

            crewmateEmoji = client.emojis.cache.find(e => e.id === crewmateEmojiId);
            console.log('emoji fallback : ', crewmateEmoji);

            crewmateEmoji = client.emojis.cache.get(crewmateEmojiId);
            console.log('emoji fallback : ', crewmateEmoji);

            crewmateEmoji = client.emojis.cache.get(':muscle:785560872294547497');
            console.log('emoji fallback : ', crewmateEmoji);
            
            if(!crewmateEmoji) return;
        }
            
        const h = db.genHash();
        
        console.log('args ', args);
        
        var time = moment(args[0], allowedTimeFormats);
        console.log('HH:mm', time.format('HH:mm'), time.isValid());
        
        if (!args.length > 0 || !time.isValid()) {
            message.channel.send(`${message.author} cette commande doit être suivie d'une heure valide pour fonctionner (HH:mm)`);
            return;
        }
        
        let lobbyType = allowedLobbyTypes[0];
        if(args.length == 2 && allowedLobbyTypes.indexOf(args[1]) !== -1) {
            lobbyType = args[1];
            console.log('lobbyTypeFound : ', lobbyType);
        }
        
        commandUser.roles.add(crewmateRole);
        logsChannel.send(`${message.author} a ouvert un lobby de type : ${lobbyType},\n||(#**${h}**)||`);
        
        //Add voice & text private channels based on h const
        gameChannel.send(`||@everyone||\n\n📢  ${message.author} organise une game **Among Us** !!!
        \n\n Mode **${lobbyType}** aujourd'hui à **${time.format('HH:mm')}** !
        \n\n ➡️ Pour participer : réagir à ce message avec l'émote :  <:crewmate:${crewmateEmojiId}> (sans quoi votre participation ne comptera pas)
        \n\n 🔵 Vous obtiendrez le rôle **${crewmateRole}** ainsi que l'accès au channel <#${crewChannel.id}> pour préparer votre game !
        \n\n 🔵 Vous aurez également accès au channels vocaux **Lobby 1 & 2 !** (⚠️ **Sans ce rôle vous ne pourrez pas vous connecter en vocal !** ⚠️)
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
    else if(command === 'pickup') {

        if(message.member.bot) return;
        console.log(args)
        console.log(message.member.roles.cache.has(pickupRoleId) && args.length > 0 && (args[0] === 'r' || args[0] === 'remove'));
        if(message.member.roles.cache.has(pickupRoleId) && args.length > 0 && (args[0] === 'r' || args[0] === 'remove'))
        {
            message.member.roles.remove(pickupRole);
            console.log(`${message.member} a quitté le role ${pickupRole.name}`);
            message.channel.send(`${message.member} a quitté le role ${pickupRole}`);
            return;
        }
        else 
        {
            if(gameChannel.messages.cache.size > 0 && (message.channel.id === generalChannelId || message.channel.id === botChannelId)) {
                message.member.roles.add(pickupRole);
                console.log(`${message.member} a rejoint le role ${pickupRole.name}`);
                message.channel.send(`${message.member} a rejoint le role ${pickupRole}`);
            } else {
                message.channel.send(`${message.author}, aucune game en cours, le rôle ${pickupRole} ne peut être demandé que pendant une game.`);
            }
        }
        return;
    };
});

//Adding roles on messageReactionAdd Event
client.on('messageReactionAdd', async (reaction, user) => {
    
    // ONIIII: should get reactions from messages when bot was offline
    if (reaction.partial) {
		// If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message: ', error);
			// Return as `reaction.message.author` may be undefined/null
			return;
		}
	}

    const message = reaction.message;
    getMember(user.id).then(member => {
        console.log(member);
        //add crewmate role on desired reaction
        if(reaction.emoji.name === 'crewmate' && !user.bot && message.channel.id === gameChannel.id && message.author.bot)
        {
            if(member !== null)
            {
                member.roles.add(crewmateRole);
                console.log(`${member} a rejoint le role ${crewmateRole.name}`);
                logsChannel.send(`${member} a rejoint le role ${crewmateRole.name}`);
                message.edit(message.content + `\n* ${member}`);
            }
            else {
                console.log('Erreur lors de l\'ajout du rôle : membre inexistant ou kick (cache)');
                return;
            }
        }
    });
});

//Removing roles on messageReactionRemove Event
client.on('messageReactionRemove', (reaction, user) => {
    const message = reaction.message;  
    const msgUser = message.guild.members.cache.get(user.id);
    
    //remove crewmate role on desired reaction
    if(reaction.emoji.name === 'crewmate' && !user.bot && message.channel.id === gameChannel.id && message.author.bot)
    {
        //Fix error when removing role on ban/kicked member
        if(msgUser != null)
        {
            msgUser.roles.remove(crewmateRole);
            console.log(`${msgUser} a quitté le role ${crewmateRole.name}`);
            logsChannel.send(`${msgUser} a quitté le role ${crewmateRole.name}`);
            message.edit(message.content.replace(`\n* ${msgUser}`, ''));
        }
        else {
            console.log('Erreur quand à la suppresion du rôle : membre inexistant ou kick');
            return;
        } 
    }
});

//Welcome message on guildMemberAdd event
client.on('guildMemberAdd', (member) => {
    member.guild.channels.cache.get(generalChannelId)
    .send('**<@' + member.id + '>** est sorti d\'une vent !! \nVotez le prochain buzz !');
});

//Log message on guildMemberRemove event
client.on('guildMemberRemove', (member) =>{
    client.channels.cache.get(logsChannelId).send(`**${member}** a quitté le serveur.`);
});

//Bot login, code must be above this line.
client.login(token);

function genHash() {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let h = "";
    let n = 24;
    for(let i = 0; i < n; i++) {
        h += chars[Math.floor(Math.random() * chars.length)];
    }
    return h;
};

function getUserFromArgs(userArg) {
    const userId = userArg.substr(3,18);
    const user = server.members.cache.get('266293059526983691');
    if(user) {
        console.log('user found : ', user.nickname);
        return user;
    }

    console.log('user ' + arg + ' not found')
    return undefined;
};