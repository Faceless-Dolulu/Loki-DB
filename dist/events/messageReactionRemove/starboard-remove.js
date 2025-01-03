import { EmbedBuilder, } from "discord.js";
import starboardChannelSchema from "../../models/StarBoard.js";
export default async function (reaction, user, client, handler) {
    try {
        const starboardConfig = await starboardChannelSchema.findOne({
            guildId: reaction.message.guildId,
        });
        if (!starboardConfig)
            return;
        const message = reaction.message;
        if (reaction.emoji.name !== `${starboardConfig.emoji}` ||
            message.author?.bot)
            return;
        const starChannel = message.guild?.channels.cache.get(starboardConfig.channelId) ||
            (await message.guild?.channels.fetch(starboardConfig.channelId));
        const fetchedStarboardEntries = starChannel.messages.fetch({
            limit: 100,
        });
        const stars = (await fetchedStarboardEntries).find((m) => m.embeds[0].footer?.text.startsWith(starboardConfig.emoji) &&
            m.embeds[0].footer?.text.endsWith(message.id));
        if (!stars)
            return;
        const starBoardEntry = new EmbedBuilder()
            .setColor("Gold")
            .setAuthor({
            name: message.author?.username,
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
            const [images, nonImages] = message.attachments.partition((a) => a.contentType?.includes("image/"));
            const image = images.first()?.proxyURL;
            starBoardEntry.setImage(image);
        }
        if (reaction.count >= starboardConfig.reactionCount) {
            stars.edit({ embeds: [starBoardEntry] });
            return true;
        }
        if (reaction.count < starboardConfig.reactionCount || !reaction.count) {
            stars.delete();
            return true;
        }
    }
    catch (error) { }
}
