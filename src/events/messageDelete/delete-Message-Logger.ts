import {
	AuditLogEvent,
	BaseGuildTextChannel,
	EmbedBuilder,
	User,
	type Client,
	type Message,
	type PartialMessage,
} from "discord.js";
import type { CommandKit } from "commandkit";
import messageLogsChannelSchema from "../../models/MessageLogs.js";
import { fileURLToPath } from "url";

export default async function (
	message: Message<boolean> | PartialMessage,
	client: Client<true>,
	handler: CommandKit
) {
	try {
		const messageLogsConfigs = await messageLogsChannelSchema.find({
			guildId: message.guildId,
		});
		if (message.author?.bot || !messageLogsConfigs.length) return;
		const logs = await message.guild?.fetchAuditLogs({
			type: AuditLogEvent.MessageDelete,
			limit: 1,
		});
		if (message.partial) {
			return;
		}
		const firstEntry = logs?.entries.first();
		const messageAuthor = message.author;

		const executor = firstEntry?.executor as User;

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
			const logChannel =
				(message.guild?.channels.cache.get(
					messageLogsConfig.channelId
				) as BaseGuildTextChannel) ||
				((await message.guild?.channels.fetch(
					messageLogsConfig.channelId
				)) as BaseGuildTextChannel);

			if (!logChannel) {
				messageLogsChannelSchema
					.findOneAndDelete({
						guildId: message.guildId,
						channelId: messageLogsConfig.channelId,
					})
					.catch(() => {});
			}
			logChannel.send({ embeds: [embed] });
		}
	} catch (error) {
		console.log(`Error in ${fileURLToPath(import.meta.url)}`, error);
	}
}
