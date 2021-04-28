module.exports = {
    name: 'invit',
    aliases: ['inv', 'invitation', 'i'],
    description: 'Send a unique invitation from server',
    execute(message) {
        message.channel.send(`${message.author}, https://discord.gg/SKKsRNu`);
    },
}