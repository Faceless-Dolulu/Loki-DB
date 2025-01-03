import { EmbedBuilder, } from "discord.js";
import suggestionChannelSchema from "../../models/SuggestionsChannel.js";
export default async (interaction, Client, handler) => {
    try {
        if (!interaction.isFromMessage)
            return;
        if (interaction.customId === "Suggestion") {
            const suggestion = interaction.fields.getTextInputValue("suggestionInput");
            const suggestionConfig = await suggestionChannelSchema.findOne({
                guildId: interaction.guildId,
            });
            if (!suggestionConfig)
                return;
            const suggestionChannel = interaction.guild?.channels.cache.get(suggestionConfig?.channelId) ||
                (await interaction.guild?.channels.fetch(suggestionConfig?.channelId));
            const embed = new EmbedBuilder()
                .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL(),
            })
                .setDescription(suggestion)
                .setTimestamp()
                .setColor("DarkBlue")
                .setFooter({ text: `Suggestion Author ID: ${interaction.user.id}` });
            await suggestionChannel.send({ embeds: [embed] });
            await suggestionChannel.lastMessage?.react(`✅`);
            await suggestionChannel.lastMessage?.react("❌");
            interaction.reply({
                content: `Your submission has been received!`,
                ephemeral: true,
            });
        }
    }
    catch (error) {
        console.log(error);
    }
};
