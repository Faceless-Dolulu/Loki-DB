const { SlashCommandBuilder } = require('discord.js');
const { ReloadType } = require('commandkit');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cmdreloaddev')
        .setDescription('Reloads all DevOnly Commands.'),
    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply();

        await handler.reloadCommands.dev;

        interaction.followUp(`Developer commands have been reloaded.`);
    },
    options: {
        devOnly: true,
    },
};