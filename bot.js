const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();

client.commands = new Discord.Collection();
const commandFolders = fs.readdirSync('./commands');

for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		client.commands.set(command.name, command);
	}
}
const version = require('./package.json').version;
const { prefix, token, serverId, pickupRoleId, crewmateRoleId, modoRoleId, logsChannelId, crewChannelId, gameChannelId, botChannelId, generalChannelId,} = require('./config.json');

let server, pickupRole, crewmateRole, modoRole, logsChannel, generalChannel, crewChannel, gameChannel;
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
    server.channels.cache.get('764572804444061697').send(`❗ Connecté sur **${server}** (v.${version})`);
    console.log(server);

    client.user.setActivity(`the cameras...`, { type: "WATCHING"});

    // Caching all members on Bot init (->bug on reactions to messages with inactives/deleted users)
    server.members.fetch().then((members) => {
         fetchedMembers = members;
         console.log(fetchedMembers.size + ' members found');
         logsChannel.send(`⭕ **${members.size}** membres mis en cache.\n✅ **FIN** de la mise en cache des membres sur **${server}**`)
    });
    
    //Load global variables
    pickupRole = server.roles.cache.get(pickupRoleId);
    console.log('pickup role found :', pickupRole)

    crewmateRole = server.roles.cache.get(crewmateRoleId);
    console.log('crewmate role found :', crewmateRole)

    modoRole = server.roles.cache.get(modoRoleId);
    console.log('modérateur role found :', modoRole)

    logsChannel = server.channels.cache.get(logsChannelId);
    console.log('logs channel found :', logsChannel)

    generalChannel = server.channels.cache.get(generalChannelId);
    console.log('general channel found :', generalChannel)

    crewChannel = server.channels.cache.get(crewChannelId);
    console.log('crew channel found :', crewChannel)
    
    gameChannel = server.channels.cache.get(gameChannelId);
    console.log('game channel found :', crewmateRole);

    //Export it for external files
    module.exports = {pickupRole, crewmateRole, modoRole, logsChannel, generalChannel, crewChannel, gameChannel};
});

client.on('message', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return message.channel.send(`${message.author}, commande invalide ou inexistante ! \n Tapez !aide pour une assistance.`);

    if (command.permissions) {
        const authorPerms = message.channel.permissionsFor(message.author);
        if (!authorPerms || !authorPerms.has(command.permissions)) {
            return message.reply('Vous ne pouvez pas éxécuter cette commande.');
        }
    }

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('Erreur pendant l`execution de cette commande.');
    }
});
//Adding roles on messageReactionAdd Event
client.on('messageReactionAdd', (reaction, user) => {
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