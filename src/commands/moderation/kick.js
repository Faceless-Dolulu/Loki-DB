const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a user from this server')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('The member you want to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for kicking this member')
                .setRequired(true)),
    run: async ({ interaction, client, handler }) => {
        const targetUserId = await interaction.options.get('member').value;
        const reason = await interaction.options.get('reason').value;
        const targetUser = await interaction.guild.members.fetch(targetUserId)
            .then(console.log).catch(console.error);
     

        await interaction.deferReply();

        if (!targetUser) {
           await interaction.followUp({ content: `This user is not a member of this server`, ephemeral: true });
            return;
        }

        

        if (targetUser.id === interaction.guild.ownerId) {
            await interaction.followUp({ content: `You can't kick that user because they are the server owner`, ephemeral: true });
            return;
        }

        const targetUserRolePosition = await targetUser.roles.highest.position; // Highest role of the target user
        const requestUserRolePosition = await interaction.member.roles.highest.position; // Highest role of the user running the command
        const botRolePosition = await interaction.guild.members.me.roles.highest.position; //Highest role of the bot

        if (targetUserRolePosition >= botRolePosition) {
            await interaction.followUp({ content: `I cannot kick that user because they have the same or higher role than me`, ephemeral: true });
            return;
        }

        if (targetUserRolePosition >= requestUserRolePosition) {
            await interaction.followUp({ content: `You cannot kick that user because they have the same or higher role than you`, ephemeral: true });
            return;
        }

        try {
            await targetUser.send(`You have been kicked from **${interaction.guild.name}** \nReason: ${reason}`);
            await targetUser.kick({ reason });
            await interaction.followUp({ content: `User ${targetUser} has been kicked. \n Reason: ${reason}` });
        } catch (error) {
            console.log(`There was an error when kicking: ${error}`);
        }


    },
    options: {
        userPermissions: [`KickMembers`],
        botPermissions: [`KickMembers`],
    },
}
