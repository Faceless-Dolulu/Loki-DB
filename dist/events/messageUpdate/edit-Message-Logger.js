import { EmbedBuilder } from 'discord.js';
import messageLogsChannelSchema from '../../models/MessageLogs.js';
export default async function (oldMessage, newMessage, client, handler) {
    try {
        const messageLogsConfigs = await messageLogsChannelSchema.find({
            guildId: oldMessage.guildId,
        });
        console.log(oldMessage.content, '\n', newMessage.content);
        console.log(newMessage.author?.username, '\n', newMessage.author?.id, '\n', newMessage.author?.displayAvatarURL());
        if (!messageLogsConfigs.length)
            return;
        const embed = new EmbedBuilder()
            .setAuthor({ name: `${newMessage.author?.username} (ID ${newMessage.author?.id})`, iconURL: newMessage.author?.displayAvatarURL() })
            .setTitle('Message Edited')
            .addFields({ name: 'Original Message', value: `${oldMessage.content}` }, { name: 'Updated Message', value: `${newMessage.content}` })
            .setTimestamp()
            .setColor(0x33bbff);
        for (const messageLogsConfig of messageLogsConfigs) {
            const logChannel = oldMessage.guild?.channels.cache.get(messageLogsConfig.channelId)
                ||
                    (await oldMessage.guild?.channels.fetch(messageLogsConfig.channelId));
            if (!logChannel) {
                messageLogsChannelSchema.findOneAndDelete({
                    guildId: oldMessage.guildId,
                    channelId: messageLogsConfig.channelId,
                }).catch(() => { });
            }
            logChannel.send({ embeds: [embed] });
        }
    }
    catch (error) {
    }
}
;
