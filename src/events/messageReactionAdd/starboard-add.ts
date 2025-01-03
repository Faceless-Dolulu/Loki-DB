import { CommandKit } from "commandkit";
import {
	BaseGuildTextChannel,
	Client,
	EmbedBuilder,
	MessageReaction,
	User,
} from "discord.js";
import starboardChannelSchema from "../../models/StarBoard.js";
export default async function (
	reaction: MessageReaction,
	user: User,
	client: Client<true>,
	handler: CommandKit
) {
	try {
		const starboardConfig = await starboardChannelSchema.findOne({
			guildId: reaction.message.guildId,
		});

		if (!starboardConfig) return;
		const message = reaction.message;
		if (
			reaction.emoji.name !== `${starboardConfig.emoji}` ||
			message.author?.bot
		) {
			return;
		}

		if (reaction.count >= starboardConfig.reactionCount) {
			const starChannel =
				(message.guild?.channels.cache.get(
					starboardConfig.channelId
				) as BaseGuildTextChannel) ||
				((await message.guild?.channels.fetch(
					starboardConfig.channelId
				)) as BaseGuildTextChannel);

			const fetchedStarboardEntries = starChannel.messages.fetch({
				limit: 100,
			});
			const stars = (await fetchedStarboardEntries).find(
				(m) =>
					m.embeds[0].footer?.text.startsWith(starboardConfig.emoji) &&
					m.embeds[0].footer?.text.endsWith(message.id)
			);

			const starBoardEntry = new EmbedBuilder()
				.setColor("Gold")
				.setAuthor({
					name: message.author?.username as string,
					iconURL: message.author?.displayAvatarURL(),
				})
				.setTitle("Original Message")
				.setURL(message.url)
				.setDescription(message.content)
				.setFooter({
					text: `${reaction.emoji} ${reaction.count} | ID: ${message.id}`,
				})
				.setTimestamp(message.createdTimestamp);

			if (message.attachments) {
				const [images, nonImages] = message.attachments.partition((a) =>
					a.contentType?.includes("image/")
				);
				const image = images.first()?.proxyURL;
				starBoardEntry.setImage(image as string);
			}
			if (stars) {
				stars.edit({ embeds: [starBoardEntry] });
				return true;
			}

			if (!stars) {
				starChannel.send({ embeds: [starBoardEntry] });
				return true;
			}
		}
	} catch (error) {}
}
