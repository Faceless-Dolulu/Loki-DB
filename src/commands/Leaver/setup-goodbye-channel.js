const { SlashCommandBuilder, PermissionFlagsBits, ChannelType,  } = require('discord.js');

const goodbyeChannelSchema = require('../../models/GoodbyeChannel');

 

const data = new SlashCommandBuilder()
    .setName('setup-goodbye-channel')
    .setDescription('Setup a channel to send goodbye messages to.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
        option
            .setName('target-channel')
            .setDescription('The channel to send goodbye messages to.')
    .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
.setRequired(true)
)
.addStringOption ((option) =>
option
.setName('custom-message')
.setDescription('TEMPLATES {mention-member} {username} {server-name}')
);

async function run({interaction}) {
    try {
        const targetChannel = await interaction.options.getChannel('target-channel');
        const customMessage = interaction.options.getString('custom-message');

        await interaction.deferReply({ephemeral: true});

        const query = {
            guildId: interaction.guildId,
            channelId: targetChannel.id,
        };

        const channelExistsInDb = await goodbyeChannelSchema.exists(query);

        if (channelExistsInDb) {
            interaction.followUp(`This channel has already been configured for goodbye messages`);
            return;
        }

        const newGoodbyeChannel = new goodbyeChannelSchema({
            ...query,
            customMessage,
        });

        newGoodbyeChannel
        .save()
        .then(() => {
            interaction.followUp(`Configured ${targetChannel} to receive goodbye messages.`);
        })
        .catch((error) => {
            InteractionCollector.followUp(`Database error. Please try again in a moment.`);
            console.log(`DB error in ${__filename}: \n`, error);
        })

        
    } catch (error) {
        console.log(`Error in ${__filename}: \n`, error);
        
    }
}

module.exports = {data, run}