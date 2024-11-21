const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a user from this server')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('The member you want to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for banning this member')
                .setRequired(true)),
    run: async ({ interaction, client, handler }) => {
        const targetUserId = interaction.options.get('member').value;
        const reason =  interaction.options.get('reason').value;

        const targetUser = await interaction.guild.members.fetch(targetUserId)
            .then(console.log).catch(console.error);

        if (!targetUser) {
            interaction.reply({ content: `This user is not in this server`, ephemeral: true });
            return;
        }


        if (targetUser.id === interaction.guild.ownerId) {
            await interaction.reply({ content: `You can't ban that user because they are the server owner`, ephemeral: true });
            return;
        }

        const targetUserRolePosition = await targetUser.roles.highest.position; // Highest role of the target user
        const requestUserRolePosition = await interaction.member.roles.highest.position; // Highest role of the user running the command
        const botRolePosition = await interaction.guild.members.me.roles.highest.position; //Highest role of the bot

        if (targetUserRolePosition >= botRolePosition) {
            await interaction.reply({ content: `I cannot ban that user because they have the same or higher role than me`, ephemeral: true });
            return;
        }

        if (targetUserRolePosition >= requestUserRolePosition) {
            await interaction.reply({ content: `You cannot ban that user because they have the same or higher role than you`, ephemeral: true });
            return;
        }

        try {
            await targetUser.send(`You have been banned from **${interaction.guild.name}** \nReason: ${reason}`);
            await targetUser.ban({ reason });
            await interaction.reply({ content: `User ${targetUser} has been banned. \n Reason: ${reason}` });
        } catch (error) {
            console.log(`There was an error when banning: ${error}`);
        }


    },
    options: {
        userPermissions: [`BanMembers`],
        botPermissions: [`BanMembers`],
    },
}
