import { SlashCommandProps } from "commandkit";
import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import goodbyeChannelSchema from '../../models/GoodbyeChannel.js'

export const data = new SlashCommandBuilder()
.setName('goodbye-remove')
.setDescription('Removes a goodbye channel')
.setDMPermission(false)
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
.addChannelOption( option => 
    option
    .setName('target-channel')
    .setDescription('The channel to remove goodbye messages from')
    .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
    .setRequired(true)
);

export async function run({ interaction, client, handler}: SlashCommandProps) {
    try {
        const goodbyeChannel = interaction.options.getChannel('target-channel');
        
        await interaction.deferReply();

        const query = {
            guildId: interaction.guildId,
            channelId: goodbyeChannel?.id,
        };

        const channelExistsInDb = await goodbyeChannelSchema.exists(query);

        if (!channelExistsInDb) {
            interaction.followUp('That channel has not been configured for goodbye messages.')
            return;
        }

        goodbyeChannelSchema.findOneAndDelete(query)
        .then(() => {
            interaction.followUp(`Removed ${goodbyeChannel} from sending goodbye messages.`);
        }).catch((error) => {
            interaction.followUp('Database error. Please try again in a moment.')
            console.log(`DB error in ${__filename}: \n`, error);
        })
    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);

    }
    
}