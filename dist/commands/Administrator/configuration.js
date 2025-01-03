import { ChannelType, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder, } from "discord.js";
import banLogsChannelSchema from "../../models/BanLogs.js";
import { fileURLToPath } from "url";
import kickLogsChannelSchema from "../../models/KickLogs.js";
import timeoutLogsChannelSchema from "../../models/TimeOutLogs.js";
import messageLogsChannelSchema from "../../models/MessageLogs.js";
import warnLogsChannelSchema from "../../models/WarnLogs.js";
import suggestionChannelSchema from "../../models/SuggestionsChannel.js";
export const data = new SlashCommandBuilder()
    .setName("configure")
    .setDescription("Configure a channel for logging ban events.")
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommandGroup((subcommandGroup) => subcommandGroup
    .setName("bans")
    .setDescription("Configure ban logs.")
    .addSubcommand((subcommand) => subcommand
    .setName("add")
    .setDescription("Add a channel to log ban events.")
    .addChannelOption((option) => option
    .setName("channel")
    .setDescription("The channel to host ban logs.")
    .setRequired(true)
    .addChannelTypes(ChannelType.GuildText)))
    .addSubcommand((subcommand) => subcommand
    .setName("remove")
    .setDescription("Remove a channel from logging ban events.")
    .addChannelOption((option) => option
    .setName("channel")
    .setDescription("The channel to remove from logging ban events.")
    .addChannelTypes(ChannelType.GuildText)
    .setRequired(true))))
    .addSubcommandGroup((subcommandGroup) => subcommandGroup
    .setName("kicks")
    .setDescription("Configure kick logs.")
    .addSubcommand((subcommand) => subcommand
    .setName("add")
    .setDescription("Add a channel to log kick events.")
    .addChannelOption((option) => option
    .setName("channel")
    .setDescription("The channel to host kick logs.")
    .addChannelTypes(ChannelType.GuildText)
    .setRequired(true)))
    .addSubcommand((subcommand) => subcommand
    .setName("remove")
    .setDescription("Remove a channel from logging kick events.")
    .addChannelOption((option) => option
    .setName("channel")
    .setDescription("The channel to remove from logging kick events.")
    .addChannelTypes(ChannelType.GuildText)
    .setRequired(true))))
    .addSubcommandGroup((subcommandGroup) => subcommandGroup
    .setName("timeouts")
    .setDescription("Configure kick logs.")
    .addSubcommand((subcommand) => subcommand
    .setName("add")
    .setDescription("Add a channel to log timeout events.")
    .addChannelOption((option) => option
    .setName("channel")
    .setDescription("The channel to host timeout logs.")
    .addChannelTypes(ChannelType.GuildText)
    .setRequired(true)))
    .addSubcommand((subcommand) => subcommand
    .setName("remove")
    .setDescription("Remove a channel from logging timeout events.")
    .addChannelOption((option) => option
    .setName("channel")
    .setDescription("The channel to remove from logging timeout events.")
    .addChannelTypes(ChannelType.GuildText)
    .setRequired(true))))
    .addSubcommandGroup((subcommandGroup) => subcommandGroup
    .setName("messages")
    .setDescription("Configure message event logs.")
    .addSubcommand((subcommand) => subcommand
    .setName("add")
    .setDescription("Add a channel to log message events. (Deletions and edits)")
    .addChannelOption((option) => option
    .setName("channel")
    .setDescription("The channel to host delete and edit message logs.")
    .addChannelTypes(ChannelType.GuildText)
    .setRequired(true)))
    .addSubcommand((subcommand) => subcommand
    .setName("remove")
    .setDescription("Remove a channel from logging delete and edit message events.")
    .addChannelOption((option) => option
    .setName("channel")
    .setDescription("The channel to remove from logging delete and edit message events.")
    .addChannelTypes(ChannelType.GuildText)
    .setRequired(true))))
    .addSubcommandGroup((subcommandGroup) => subcommandGroup
    .setName("warns")
    .setDescription("Configuration for logging issued warns.")
    .addSubcommand((subcommand) => subcommand
    .setName("add")
    .setDescription("Add a channel to log issued warns.")
    .addChannelOption((option) => option
    .setName("channel")
    .setDescription("The channel to log issued warns.")
    .addChannelTypes(ChannelType.GuildText)
    .setRequired(true)))
    .addSubcommand((subcommand) => subcommand
    .setName("remove")
    .setDescription("Remove a channel from logging issued warns.")
    .addChannelOption((option) => option
    .setName("channel")
    .setDescription("The channel to remove from logging issued warns.")
    .addChannelTypes(ChannelType.GuildText)
    .setRequired(true))))
    .addSubcommandGroup((commandGroup) => commandGroup
    .setName("suggestions")
    .setDescription("Enable or Disable suggestions in your server")
    .addSubcommand((command) => command
    .setName("enable")
    .setDescription("Enables the suggestion system in your server")
    .addChannelOption((option) => option
    .setName("channel")
    .setDescription("Set the channel that suggestions are sent to")
    .setRequired(true)
    .addChannelTypes(ChannelType.GuildText)))
    .addSubcommand((command) => command
    .setName("disable")
    .setDescription("Disables the suggestion system in your server.")));
export async function run({ interaction, client, handler }) {
    try {
        await interaction.deferReply({ ephemeral: true });
        const subCommandGroup = interaction.options.getSubcommandGroup();
        const subCommand = interaction.options.getSubcommand();
        if (subCommandGroup === "bans") {
            if (subCommand === "add") {
                const banLogChannel = interaction.options.getChannel("channel");
                const query = {
                    guildId: interaction.guildId,
                    channelId: banLogChannel?.id,
                };
                const channelExistsInDB = await banLogsChannelSchema.exists(query);
                if (channelExistsInDB) {
                    interaction.followUp("This channel has already been configured for ban logs.");
                    return;
                }
                const newBanChannel = new banLogsChannelSchema({
                    ...query,
                });
                newBanChannel
                    .save()
                    .then(() => {
                    interaction.followUp(`Configured ${banLogChannel} to host ban logs.`);
                })
                    .catch((error) => {
                    interaction.followUp("Database error. Please try again in a moment");
                    console.log(`DB error in ${fileURLToPath(import.meta.url)}:\n`, error);
                });
            }
            if (subCommand === "remove") {
                const banLogChannel = interaction.options.getChannel("channel");
                const query = {
                    guildId: interaction.guildId,
                    channelId: banLogChannel?.id,
                };
                const channelExistsInDb = await banLogsChannelSchema.exists(query);
                if (!channelExistsInDb) {
                    interaction.followUp("That channel has not been configured for ban logs!");
                    return;
                }
                banLogsChannelSchema
                    .findOneAndDelete(query)
                    .then(() => {
                    interaction.followUp(`Removed ${banLogChannel} from hosting ban logs.`);
                })
                    .catch((error) => {
                    interaction.followUp(`Databse error. Please try again in a moment.`);
                    console.log(`DB error in ${fileURLToPath(import.meta.url)}:\n`, error);
                });
            }
        }
        if (subCommandGroup === "kicks") {
            if (subCommand === "add") {
                const kickLogChannel = interaction.options.getChannel("channel");
                const query = {
                    guildId: interaction.guildId,
                    channelId: kickLogChannel?.id,
                };
                const channelExistsInDb = await kickLogsChannelSchema.exists(query);
                if (channelExistsInDb) {
                    interaction.followUp("This server has already been configured with a kick logs channel");
                    return;
                }
                const newKickChannel = new kickLogsChannelSchema({
                    ...query,
                });
                newKickChannel
                    .save()
                    .then(() => {
                    interaction.followUp(`Configured ${kickLogChannel} to host kick logs.`);
                })
                    .catch((error) => {
                    interaction.followUp("Database error. Please try again in a moment.");
                    console.log(`DB error in ${fileURLToPath(import.meta.url)}:\n`, error);
                });
            }
            if (subCommand === "remove") {
                const kickLogChannel = interaction.options.getChannel("channel");
                const query = {
                    guildId: interaction.guildId,
                    channelId: kickLogChannel?.id,
                };
                const channelExistsInDb = await kickLogsChannelSchema.exists(query);
                if (!channelExistsInDb) {
                    interaction.followUp(`This server doesn't have a channel configured for ban logs!`);
                    return;
                }
                kickLogsChannelSchema
                    .findOneAndDelete(query)
                    .then(() => {
                    interaction.followUp(`Removed ${kickLogChannel} from hosting kick logs.`);
                })
                    .catch((error) => {
                    interaction.followUp(`Databse error. Please try again in a moment.`);
                    console.log(`DB error in ${fileURLToPath(import.meta.url)}:\n`, error);
                });
            }
        }
        if (subCommandGroup === "timeouts") {
            if (subCommand === "add") {
                const timeoutLogChannel = interaction.options.getChannel("channel");
                const query = {
                    guildId: interaction.guildId,
                    channelId: timeoutLogChannel?.id,
                };
                const channelExistsInDb = await timeoutLogsChannelSchema.exists(query);
                if (channelExistsInDb) {
                    interaction.followUp("This channel has already been configured for timeout logs.");
                    return;
                }
                const newTimeoutChannel = new timeoutLogsChannelSchema({
                    ...query,
                });
                newTimeoutChannel
                    .save()
                    .then(() => {
                    interaction.followUp(`Configured ${timeoutLogChannel} to host timeout logs.`);
                })
                    .catch((error) => {
                    interaction.followUp("Database error. Please try again in a moment");
                    console.log(`DB error in ${fileURLToPath(import.meta.url)}:\n`, error);
                });
            }
            if (subCommand === "remove") {
                const timeoutLogChannel = interaction.options.getChannel("channel");
                const query = {
                    guildId: interaction.guildId,
                    channelId: timeoutLogChannel?.id,
                };
                const channelExistsInDb = await timeoutLogsChannelSchema.exists(query);
                if (!channelExistsInDb) {
                    interaction.followUp("That channel has not been configured to host timeout logs!");
                    return;
                }
                timeoutLogsChannelSchema
                    .findOneAndDelete(query)
                    .then(() => {
                    interaction.followUp(`Removed ${timeoutLogChannel} from hosting timout logs`);
                })
                    .catch((error) => {
                    interaction.followUp("Daabase error. Please try again in a moment");
                    console.log(`DB error in ${fileURLToPath(import.meta.url)}:\n`, error);
                });
            }
        }
        if (subCommandGroup === "messages") {
            if (subCommand === "add") {
                const logChannel = interaction.options.getChannel("channel");
                const query = {
                    guildId: interaction.guildId,
                    channelId: logChannel?.id,
                };
                const channelExistsInDb = await messageLogsChannelSchema.exists(query);
                if (channelExistsInDb) {
                    interaction.followUp("This channel has already been configured for logging message events.");
                    return;
                }
                const newLogChannel = new messageLogsChannelSchema({
                    ...query,
                });
                newLogChannel
                    .save()
                    .then(() => {
                    interaction.followUp(`Configured ${logChannel} to log message events.`);
                })
                    .catch((error) => {
                    interaction.followUp("Database error. Please try again in a moment.");
                    console.log(`DB error in ${fileURLToPath(import.meta.url)}:\n`, error);
                });
            }
            if (subCommand === "remove") {
                const logChannel = interaction.options.getChannel("channel");
                const query = {
                    guildId: interaction.guildId,
                    channelId: logChannel?.id,
                };
                const channelExistsInDB = await messageLogsChannelSchema.exists(query);
                if (!channelExistsInDB) {
                    interaction.followUp("This server doesn't have a channel configured to log message events!");
                    return;
                }
                messageLogsChannelSchema
                    .findOneAndDelete(query)
                    .then(() => {
                    interaction.followUp(`Removed ${logChannel} from logging message events.`);
                })
                    .catch((error) => {
                    interaction.followUp(`Databse error. Please try again in a moment.`);
                    console.log(`DB error in ${fileURLToPath(import.meta.url)}: \n`, error);
                });
            }
        }
        if (subCommandGroup === "warns") {
            if (subCommand === "add") {
                const warnLogChannel = interaction.options.getChannel("channel");
                const query = {
                    guildId: interaction.guildId,
                    channelId: warnLogChannel?.id,
                };
                const channelExistsInDb = await warnLogsChannelSchema.exists(query);
                if (channelExistsInDb) {
                    interaction.followUp("This channel has already been configured for logging issued warns.");
                    return;
                }
                const newWarnChannel = new warnLogsChannelSchema({
                    ...query,
                });
                newWarnChannel
                    .save()
                    .then(() => {
                    interaction.followUp(`Configured ${warnLogChannel} to log issued warns.`);
                })
                    .catch((error) => {
                    interaction.followUp("Databse error. Please try again in a moment.");
                    console.log(`DB error when adding warn channel in ${fileURLToPath(import.meta.url)}:\n`, error);
                });
            }
            if (subCommand === "remove") {
                const warnLogChannel = interaction.options.getChannel("channel");
                const query = {
                    guildId: interaction.guildId,
                    channelId: warnLogChannel?.id,
                };
                const channelExistsInDb = await warnLogsChannelSchema.exists(query);
                if (!channelExistsInDb) {
                    interaction.followUp(`That channel has not been configured for logging warns!`);
                    return;
                }
                banLogsChannelSchema
                    .findOneAndDelete(query)
                    .then(() => {
                    interaction.followUp(`Removed ${warnLogChannel} from hosting warn logs.`);
                })
                    .catch((error) => {
                    interaction.followUp(`Database error. Please try again in a moment.`);
                    console.log(`DB error in ${fileURLToPath(import.meta.url)}:\n`, error);
                });
            }
        }
        if (subCommandGroup === "suggestions") {
            if (subCommand === "enable") {
                const suggestionChannel = interaction.options.getChannel("channel");
                const query = {
                    guildId: interaction.guildId,
                    channelId: suggestionChannel?.id,
                };
                const channelExistsInDb = await suggestionChannelSchema.exists(query);
                if (channelExistsInDb) {
                    interaction.followUp("This server already has a suggestions system configured");
                    return;
                }
                const newSuggestionChannel = new suggestionChannelSchema({
                    ...query,
                });
                newSuggestionChannel
                    .save()
                    .then(() => {
                    interaction.followUp(`Suggestions have now been configured. When a suggestion is made, it will be sent to ${suggestionChannel}`);
                })
                    .catch((error) => {
                    interaction.followUp("Database error. Please try again in a moment.");
                    console.log(`DB error in ${fileURLToPath(import.meta.url)}:\n`, error);
                });
            }
            if (subCommand === "disable") {
                const suggestionConfigured = await suggestionChannelSchema.exists({
                    guildId: interaction.guildId,
                });
                if (!suggestionConfigured) {
                    interaction.followUp(`This server doesn't have suggestions configured for this server.`);
                    return;
                }
                suggestionChannelSchema
                    .findOneAndDelete({ guildId: interaction.guildId })
                    .then(() => {
                    interaction.followUp(`Suggestions have now been disabled in this server.`);
                })
                    .catch((error) => {
                    interaction.followUp(`Databse error. Please try again in a moment.`);
                    console.log(`DB error in ${fileURLToPath(import.meta.url)}:\n`, error);
                });
            }
        }
    }
    catch (error) {
        console.log(`Error in ${fileURLToPath(import.meta.url)}:\n`, error);
    }
}
