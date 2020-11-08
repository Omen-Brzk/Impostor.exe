const Discord = require('discord.js');
const { Client, Intents } = require("discord.js");
const intents = new Intents([
    Intents.NON_PRIVILEGED, // include all non-privileged intents, would be better to specify which ones you actually need
    "GUILD_MEMBERS", // lets you request guild members (i.e. fixes the issue)
]);

const client = new Client({ ws: { intents } });
const { prefix, token, serverId, logsChanId, crewmateRoleId, crewChannelId, gameChannelId } = require('./config.json');

// Not Used, just to try a DB
// const low = require('lowdb');
// const FileSync = require('lowdb/adapters/FileSync');
// const adapter = new FileSync('db.json');
// const db = low(adapter); 

// moment is used for hours
const moment = require('moment');
const allowedTimeFormats = ['HH:mm'];

const allowedLobbyTypes = ['all', 'chill', 'intermediate'];

let server = undefined;
let crewmateRole = undefined;
let logsChannel = undefined;
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
    //// test d'insertion de valeurs en DB locale
    // db.set('users', [{'name':'jonv11', 'role':'pussy'},{'name':'redule26', 'role':'pussy'}]).write();
    // const dbcontent = db.get('users');
    // console.log(dbcontent.value());
    // logsChan.send("Contenu de la DB = \n" + dbcontent.value());
    
    server = client.guilds.cache.get(serverId);
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(server);

    /**getMember('266293059526983691').then((member, err) => {
        console.log(member,err);
    });**/

    server.members.fetch().then((members) => {
         fetchedMembers = members;
         console.log('fetched');
    });
    
    crewmateRole = server.roles.cache.get(crewmateRoleId);
    console.log('crewmate role found :', crewmateRole)

    logsChannel = server.channels.cache.get(logsChanId);
    console.log('logs channel found :', logsChannel)

    crewChannel = server.channels.cache.get(crewChannelId);
    console.log('crew channel found :', crewChannel)
    
    gameChannel = server.channels.cache.get(gameChannelId);
    console.log('game channel found :', crewmateRole);
    
    // logsChannel.send(`Bot connecté en tant que ${client.user.tag}`);
    // logsChannel.send(`🕖 **Début** de la mise en cache des membres sur **${server}**...`);
    
    // // Caching all members on Bot init (->bug on reactions to messages with inactives users)
    // server.members.fetch().then((members) => {
    // console.log(members.size)
    //     logsChannel.send(`⭕ **${members.size}** membres mis en cache.
    //     \n✅ **FIN** de la mise en cache des membres sur **${server}**`)
    //     .catch(console.error);
    // });
});

client.on('message', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const validCommands = ['lobby', 'gameover', 'purge', 'help', 'i'];
    
    //Discord invite command
    if (command === 'i')
    {
        message.channel.send(`${message.author}, https://discord.gg/SKKsRNu`);
        return;
    }
    //help command
    else if (command === 'help' || command === 'h')
    {
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
            .addField('⚠️Précisions pour la commande !lobby ⚠️\n\n', 'Concernant la commande **!lobby** elle attend une (option) pour fonctionner à savoir un horaire \n\nPar exemple : !lobby 22 créera un **lobby programmé pour 22h00 !**\n\n!lobby 22 30 créera un **lobby programmé pour 22h30 !**\n\nChaque personne voulant rejoindre votre lobby devra **réagir au message dans <#763376836025122837> avec l\'emote <:crewmate:764152978957271060>** pour obtenir le rôle **<@&764968869973458947>**. \n\nLes <@&764968869973458947> ont accès aux channels vocaux Lobby 1 & 2 ainsi qu\'au channel <#765225922059042856>, **sans ce rôle vous ne pourrez rejoindre le lobby !⚠️**', true)
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
    // Clean command for all crewmates members & lobby's message after a game
    else if (command === 'gameover')
    {
        if(message.member.hasPermission('MANAGE_MESSAGES'))
        {
            if(args.length)
            {
                if(args[0].length < 24) {
                    return message.channel.send(`${message.author}, id de partie invalide ou inexistant.`);
                }
                
                else if(args[0].length === 24)
                {
                    const check = args;
                    const gameChan = message.guild.channels.cache.get('763376836025122837');
                    
                    gameChan.messages.fetch().then(msg => {
                        let msgDel = msg.filter(msg => msg.content.includes(check));
                        console.log(msgDel);
                        if(!msgDel.find(m => m.id)) {
                            return message.channel.send(`${message.author}, id de partie invalide ou inexistant.`);
                        }
                        gameChan.bulkDelete(msgDel);
                        logsChannel.send(`Partie ||#**${args[0]}**|| supprimée par ${message.author}`);
                        message.guild.members.cache.forEach(member => {
                            if(!member.roles.cache.find(t => t.id == '764968869973458947')) return;
                            member.roles.remove('764968869973458947')
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
        
        const crewmateEmoji = message.guild.emojis.cache.get('764152978957271060');
        const h = genHash();
        
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
        gameChannel.send(`||@everyone||\n\n📢  ${message.author} organise une game **Among Us** en mode **${lobbyType}** aujourd'hui à **${time.format('HH:mm')}** !
        \n\n ➡️  Pour participer : Merci de **réagir à ce message avec l'émote :  <:crewmate:764152978957271060>  (sans quoi votre participation ne comptera pas) !!!**
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
    else if(command != validCommands || !command) {
        message.channel.send(`${message.author}, commande invalide ou inexistante ! \n Tapez !help pour une assistance.`);
        return;
    };
});

//Adding roles on messageReactionAdd Event
client.on('messageReactionAdd', (reaction, user) => {
    const message = reaction.message;
    //const msgUser = message.guild.members.cache.get(user.id);
    getMember(user.id).then(member => {
        console.log(member.nickname);
        //add crewmate role on desired reaction
        if(reaction.emoji.name === 'crewmate' && !user.bot && message.channel.id === gameChannel.id && message.author.bot)
        {
            if(member !== null) // && msgUser.roles.find(r => r.name === crewmateRole.name) === null) 
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
    member.guild.channels.cache.get('763437048450646036')
    .send('**<@' + member.id + '>** est sorti d\'une vent !! \nVotez le prochain buzz !');
});

//Log message on guildMemberRemove event
client.on('guildMemberRemove', (member) =>{
    client.channels.cache.get('764572804444061697').send(`**${member}** a quitté le serveur.`);
});

function genHash() {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let h = "";
    let n = 24;
    for(let i = 0; i < n; i++) {
        h += chars[Math.floor(Math.random() * chars.length)];
    }
    return h;
};

//Bot login, code must be above this line.
client.login(token);