import { AuditLogEvent, EmbedBuilder, } from "discord.js";
import messageLogsChannelSchema from "../../models/MessageLogs.js";
import { fileURLToPath } from "url";
export default async function (message, client, handler) {
    try {
        const messageLogsConfigs = await messageLogsChannelSchema.find({
            guildId: message.guildId,
        });
        if (message.author?.bot || !messageLogsConfigs.length)
            return;
        const logs = await message.guild?.fetchAuditLogs({
            type: AuditLogEvent.MessageDelete,
            limit: 1,
        });
        if (message.partial) {
            return;
        }
        const firstEntry = logs?.entries.first();
        const messageAuthor = message.author;
        const executor = firstEntry?.executor;
        const embed = new EmbedBuilder()
            .setAuthor({
            name: `${executor.username}`,
            iconURL: executor.displayAvatarURL(),
        })
            .addFields({
            name: "\u200b",
            value: `**Message sent by ${messageAuthor} deleted in ${message.channel}**\n${message.content}`,
        })
            .setFooter({
            text: `Author: ${message.author?.id} | Message ID: ${message.id}`,
        })
            .setTimestamp()
            .setColor(0x33bbff);
        for (const messageLogsConfig of messageLogsConfigs) {
            const logChannel = message.guild?.channels.cache.get(messageLogsConfig.channelId) ||
                (await message.guild?.channels.fetch(messageLogsConfig.channelId));
            if (!logChannel) {
                messageLogsChannelSchema
                    .findOneAndDelete({
                    guildId: message.guildId,
                    channelId: messageLogsConfig.channelId,
                })
                    .catch(() => { });
            }
            logChannel.send({ embeds: [embed] });
        }
    }
    catch (error) {
        console.log(`Error in ${fileURLToPath(import.meta.url)}`, error);
    }
}
