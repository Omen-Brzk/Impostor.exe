const {crewmateRoleId, modoRoleId, crewChannelId, gameChannelId, crewmateEmojiId, pickupRoleId } = require('../../config.json');
const Discord = require('discord.js');

module.exports = {
    name: 'help',
    aliases: ['aide', 'h', 'info'],
    description: 'Display an embed with available commands on this server',
    execute(message) {
        const msghelp = `Concernant la commande **!lobby** elle attend une (option) pour fonctionner à savoir un horaire \n\n` + 
        `Par exemple :\n !lobby 22 créera un **lobby programmé pour 22h00 !**\n!lobby 22:30 créera un **lobby programmé pour 22h30 !**\n\n` +
        `Chaque personne voulant rejoindre votre lobby devra **réagir au message dans <#${gameChannelId}> avec l\'emote <:crewmate:${crewmateEmojiId}>** pour obtenir le rôle **<@&${crewmateRoleId}>**. \n\n` +
        `Les <@&${crewmateRoleId}> ont accès aux channels vocaux Lobby 1 & 2 ainsi qu\'au channel <#${crewChannelId}> :\n⚠️**sans ce rôle vous ne pourrez rejoindre le lobby !⚠️**` ;
        const helpEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Liste des commandes :')
        .setThumbnail('https://cdn.discordapp.com/attachments/395859711825805317/765613380891312208/unnamed.png')
        .addFields(
            { name: '**!h**, **!help**, **!aide**, **!info**', value: 'Ouvre une fenêtre d\'aide avec les commandes disponibles.'},
            { name: '\u200B', value: '----' },
            { name: '**!i**, **!invit**, **!invitation**', value: 'Vous envoie un message avec l\'invitation **unique** du serveur Discord.'},
            { name: '\u200B', value: '----' },
            { name: '**!pickup**', value: `Vous donnera le rôle <@&${pickupRoleId}>, celui-ci vous permettra d'être notifié lorsqu'une place se libère. Uniquement disponible lorsqu'une (ou plusieures) game(s) est/sont crée(s).`},
            { name: '\u200B', value: '----' },
            { name: '**!lobby (option)**', value: `Crée un message dans <#${gameChannelId}> cliquable pour organiser et rejoindre un lobby.`},
            { name: '\u200B', value: '----' }
        )
        .addField('⚠️Précisions pour la commande !lobby ⚠️\n\n', msghelp, true)
        .addField('\u200B', `---- \nSi vous avez besoin d\'aide MP => <@&${modoRoleId}>`)
        .setFooter(`Plusieurs commandes seront ajoutées/modifées dans le futur!`)
        .setTimestamp();
            
        return message.channel.send(helpEmbed);
    },
}