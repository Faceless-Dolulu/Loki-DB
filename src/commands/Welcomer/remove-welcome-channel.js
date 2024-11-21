const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const welcomeChannelSchema = require('../../models/WelcomeChannel')

const data = new SlashCommandBuilder()
    .setName('remove-welcome-channel')
    .setDescription('Remove a welcome channel.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
        option
            .setName('target-channel')
            .setDescription('The channel to remove welcome messages from')
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            .setRequired(true)
);

async function run({interaction }) {
    try {
        const targetChannel = interaction.options.getChannel('target-channel');
        await interaction.deferReply({ ephemeral: true });

        const query = {
            guildId: interaction.guildId,
            channelId: targetChannel.id,
        };

        const channelExistsInDb = await welcomeChannelSchema.exists(query);

        if (!channelExistsInDb) {
            interaction.followUp('That channel has not been configured for welcome messages.');
            return;
        }
        welcomeChannelSchema.findOneAndDelete(query)
            .then(() => {
                interaction.followUp(`Removed ${targetChannel} from recieving welcome messages.`);
            })
            .catch((error) => {
                interaction.followUp(`DB error in ${__filname}: \n`, error);
            })
    }
    catch (error) {
        console.log(`Error in ${__filename}: \n`, error);
    }
}


module.exports = { data, run }
