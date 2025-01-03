import { ChannelType, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder, } from "discord.js";
import starboardChannelSchema from "../../models/StarBoard.js";
import { fileURLToPath } from "url";
export const data = new SlashCommandBuilder()
    .setName("starboard")
    .setDescription("Configure starboard in your server.")
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((command) => command
    .setName("add")
    .setDescription("Adds starboard to your server")
    .addChannelOption((option) => option
    .setName("channel")
    .setDescription("The channel that you want to host the starboard in.")
    .addChannelTypes(ChannelType.GuildText)
    .setRequired(true))
    .addIntegerOption((option) => option
    .setName("reaction-count")
    .setDescription("The minimum amount of reactions needed to append a message to the starboard. Default is 5"))
    .addStringOption((option) => option
    .setName("emoji")
    .setDescription("Set what emoji you want to use for your starboard. Default is ⭐")))
    .addSubcommand((command) => command
    .setName("remove")
    .setDescription("Removes starboard from your server."));
export async function run({ interaction, client, handler }) {
    try {
        await interaction.deferReply({ ephemeral: true });
        const subCommand = interaction.options.getSubcommand();
        if (subCommand === "add") {
            const starboardChannel = interaction.options.getChannel("channel");
            const emoji = interaction.options.getString("emoji") || "⭐";
            const minReactions = interaction.options.getInteger("reaction-count") || 5;
            const query = {
                guildId: interaction.guildId,
                channelId: starboardChannel?.id,
            };
            const channelExistsInDb = await starboardChannelSchema.exists(query);
            if (channelExistsInDb) {
                interaction.followUp("This server already has a starboard channel configured!");
                return;
            }
            const newStarboard = new starboardChannelSchema({
                ...query,
                reactionCount: minReactions,
                emoji: emoji,
            });
            newStarboard
                .save()
                .then(() => {
                interaction.followUp(`Configured starboard in ${starboardChannel}`);
            })
                .catch((error) => {
                interaction.followUp("Database error. Please try again in a moment");
                console.log(`DB error in ${fileURLToPath(import.meta.url)}:\n`, error);
            });
        }
        if (subCommand === "remove") {
            const query = {
                guildId: interaction.guildId,
            };
            const starboardExists = await starboardChannelSchema.exists(query);
            if (!starboardExists) {
                interaction.followUp("This server does not have a starboard configured.");
                return;
            }
            starboardChannelSchema
                .findOneAndDelete(query)
                .then(() => {
                interaction.followUp(`Disabled starboard in this server.`);
            })
                .catch((error) => {
                interaction.followUp(`Database error. Please try again in a moment.`);
                console.log(`DB error in ${fileURLToPath(import.meta.url)}:\n`, error);
            });
        }
    }
    catch (error) { }
}
