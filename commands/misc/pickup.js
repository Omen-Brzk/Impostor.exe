module.exports = {
    name: 'pickup',
    description: 'Add Pickup role on trigger',
    permissions: 'MANAGE_MESSAGES',
    execute(message) {
        const { botChannelId, generalChannelId } = require('../../config.json');
        const { pickupRole, logsChannel } = require('../../bot.js');

         if(!message.client.bot && message.client.channels.cache.get('763376836025122837').size > 0 && (message.channel.id === generalChannelId || message.channel.id === botChannelId)) {
            message.client.roles.add(pickupRole);
            console.log(`${message.client} a rejoint : ${pickupRole}`);
            logsChannel.send(`${message.client} a rejoint le role : ${pickupRole}`);
        } else {
            message.client.channels.cache.get('763437048450646036').send(`${message.author}, aucune game en cours, le rôle ${pickupRole} ne peut être demandé que pendant une game.`);
        }
    }
};