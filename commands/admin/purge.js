module.exports = {
    name: 'purge',
    aliases: ['prune', 'del', 'suppr'],
    description: 'Delete an amount of messages between 1 & 100',
    permissions: 'MANAGE_MESSAGES',
    execute(message, args) {
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
            }),
        message.client.channels.cache.get('764572804444061697').send(`Clear effectué, ${amount} message(s) supprimés`);
    }
};