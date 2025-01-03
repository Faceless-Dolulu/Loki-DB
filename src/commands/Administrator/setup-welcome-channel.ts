import { SlashCommandProps } from "commandkit";
import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import welcomeChannelSchema from '../../models/WelcomeChannel.js';
import { channel } from "diagnostics_channel";

export const data = new SlashCommandBuilder()
.setName('welcome-setup')
.setDescription('Setup a channel to send welcome messages to.')
.setDMPermission(false)
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
.addChannelOption(option => 
    option
    .setName('target-channel')
    .setDescription('The channel to send welcome messages in.')
    .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
    .setRequired(true)
)
.addStringOption(option =>
    option
    .setName('custom-message')
    .setDescription('TEMPLATES {mention-member} {username} {server-name}')
);

export async function run({interaction, client, handler}: SlashCommandProps) {
    try {
        const welcomeChannel = interaction.options.getChannel('target-channel');
        const customMessage = interaction.options.getString('custom-message');

        await interaction.deferReply({ephemeral: true});

        const query = {
            guildId: interaction.guildId,
            channelId: welcomeChannel?.id,
        };

        const channelExistsInDb = await welcomeChannelSchema.exists(query);

        if (channelExistsInDb) {
            interaction.followUp('This channel has already been configured for welcome messages.');
            return;
        }

        const newWelcomeChannel = new welcomeChannelSchema({
            ...query,
            customMessage,
        });

        newWelcomeChannel.save()
        .then(()=> {
            interaction.followUp(`Configured ${welcomeChannel} to receive welcome messages.`);
        })
        .catch((error) => {
            interaction.followUp('Database error. Please try again in a moment');
            console.log(`DB error in ${__filename}:\n`, error);
        })
    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
}
