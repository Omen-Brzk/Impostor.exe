module.exports = {
    name: 'ping',
    description: 'Returns ping from host server',
    execute(message) {
        message.channel.send(`🏓Latence : ${Date.now() - message.createdTimestamp}ms.`);
    },
}