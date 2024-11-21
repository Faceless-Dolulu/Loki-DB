const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

const welcomeChannelSchema = require('../../models/WelcomeChannel');

const data = new SlashCommandBuilder()
    .setName('setup-welcome-channel')
    .setDescription('Setup a channel to send welcome messages to.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
        option
            .setName('target-channel')
            .setDescription('The channel to get welcome messags in.')
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('custom-message')
            .setDescription('TEMPLATESL {mention-member} {username} {server-name}')
);

async function run({interaction }) {
    try {
        const targetChannel = interaction.options.getChannel('target-channel');
        const customMessage = interaction.options.getString(`custom-message`);


        await interaction.deferReply({ ephemeral: true });

        const query = {
            guildId: interaction.guildId,
            channelId: targetChannel.id,
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

        newWelcomeChannel
            .save()
            .then(() => {
                interaction.followUp(`Configured ${targetChannel} to receive welcome messages.`);
            })
            .catch((error) => {
                interaction.followUp('Database error. Please try again in a moment.');
                console.log(`DB error in ${__filename}:\n`, error);
            })

    }
    catch (error) {
        console.log(`Error in ${__filename}: \n`, error);
    }
}


module.exports = {data, run}
