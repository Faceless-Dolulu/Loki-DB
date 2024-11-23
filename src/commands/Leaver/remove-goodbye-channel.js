const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const goodbyeChannelSchema = require('../../models/GoodbyeChannel');

const data = new SlashCommandBuilder()
.setName(`remove-goodbye-channel`)
.setDescription('Remove a goodbye channel.')
.setDMPermission(false)
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
.addChannelOption((option) => 
    option
        .setName('target-channel')
        .setDescription('The channel to remove goodbye messages from.')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(true)
);

async function run ({interaction}) {
    try {
        const targetChannel = interaction.options.getChannel('target-channel');
        await interaction.deferReply({ephemeral: true});

        const query = {
            guildId: interaction.guildId,
            channelId: targetChannel.id,
        };

        const channelExistsInDb = await goodbyeChannelSchema.exists(query);

        if (!channelExistsInDb) {
            interaction.followUp('That channel has not been conifgured for goodbye messages.');
            return;
        }
        goodbyeChannelSchema.findOneAndDelete(query)
        .then(()=> {
            interaction.followUp(`Removed ${targetChannel} from receiving goodbye messages.`);
        })
        .catch((error) => {
            interaction.followUp(`DB error in ${__filename}: \n`, error);
        })
    } 
    catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
}


module.exports = {data, run}