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
    const validCommands = ['imposteur', 'lobby'];
    const crewmateEmoji = message.guild.emojis.cache.get('764152978957271060');

    if (command === 'imposteur') {
        return message.channel.send('Votez **<@257244637650092032>** \nIl est louche...');
    }

    else if (command === 'lobby') {

        if (!args.length) {
            return message.channel.send(`${message.author} cette commande a besoin d'options pour fonctionner !`);
        }

        message.channel.send(`||@everyone||\n\n📢  ${message.author} organise une game aujourd'hui à **${args[0]}h**
        \n\n **➡️  Pour participer Merci de réagir à ce message avec l'émote :  <:crewmate:764152978957271060>  (sans quoi votre participation ne comptera pas) !!!**\n\n`)
        .then(async msg => {
            await msg.react(crewmateEmoji);
        });
    }
     
    else if(command != validCommands) {
        return message.channel.send(`${message.author}, commande invalide ou inexsitante !`);
    };
});

client.on('guildMemberAdd', (member) => {
    member.guild.channels.cache.get('763437048450646036')
    .send('**<@' + member.id + '>** est sorti d\'une vent !! \nVotez le prochain buzz !');
});


//Bot login, code must be above this line.
client.login(token);