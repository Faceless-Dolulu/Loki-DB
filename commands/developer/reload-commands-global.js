const { SlashCommandBuilder } = require('discord.js');
const { ReloadType } = require('commandkit');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('cmdreloadglobal')
        .setDescription('Reloads ALL Commands'),
    run: async ({ interaction, client, handler }) => {
        await interaction.deferReply();

        await handler.reloadCommands();

         interaction.followUp(`Global commands have been reloaded.`);
    },
    options: {
       devOnly: true,
    },
};