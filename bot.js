const Discord = require('discord.js');
const client = new Discord.Client();
const {prefix, token} = require('./auth.json');


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});



client.on('message', message => {
    if(message.content.startsWith(`${prefix}imposteur`)) {
        message.channel.send('Votez **<@257244637650092032>** \nIl est louche...');
    }
});

client.on('guildMemberAdd', (member) => {
    const guild = member.guild;
    member.guild.channels.cache.get('763437048450646036')
    .send('**<@' + member.id + '>** est sorti d\'une vent !! \nVotez le prochain buzz !');
});


client.login(token);