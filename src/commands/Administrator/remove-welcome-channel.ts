import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { SlashCommandProps } from "commandkit";
import welcomeChannelSchema from '../../models/WelcomeChannel.js';

export const data = new SlashCommandBuilder()
.setName('welcome-remove')
.setDescription('Removes a welcome channel')
.setDMPermission(false)
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
.addChannelOption( option =>
    option
    .setName('target-channel')
    .setDescription('The channel to remove welcome messages from')
    .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
    .setRequired(true)
);

export async function run ({ interaction, client, handler}: SlashCommandProps) {
    try {
        const welcomeChannel = interaction.options.getChannel('target-channel');
        await interaction.deferReply({ephemeral: true});

        const query = {
            guildId: interaction.guildId,
            channelId: welcomeChannel?.id,
        };

        const channelExistsInDb = await welcomeChannelSchema.exists(query);

        if (!channelExistsInDb) {
            interaction.followUp('That channel has not been configured for welcome messages.');
            return;
        }
        welcomeChannelSchema.findOneAndDelete(query)
        .then(()=> {
            interaction.followUp(`Removed ${welcomeChannel} from receving welcome messages.`);
        }).catch( (error) => {
            interaction.followUp(`Database error. Please try again in a moment.`);
            console.log(`DB error in ${__filename}:\n`, error);
        })
    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }

}