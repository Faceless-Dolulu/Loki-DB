const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unbans a user from your server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to unban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for unbanning this user')
                .setRequired(true)),
    run: async ({ interaction, client, handler }) => {
        const targetUserId = await interaction.options.get('user').value;
        const reason = await interaction.options.get('reason').value

        await interaction.guild.bans.fetch()
            .then(async bans => {
                if (bans.size == 0) {
                    await interaction.reply({ content: `Nobody has been banned from this server yet!`, ephemeral: true });
                    return;
                }
                let bannedID = await bans.find(ban => ban.user.id == targetUserId);

                if (!bannedID) {
                    await interaction.reply({ content: `This user hasn't been banned from this server.`, ephemeral: true });
                    return;
                }

                try {
                    await interaction.guild.bans.remove(targetUserId, reason);
                    await interaction.reply({ content: `<@${targetUserId}> has been unbanned. \nReason: ${reason}.`, ephemeral: true });
                }
                catch (error) {
                    await interaction.reply({ content: `I cannot unban this user`, ephemeral: true });
                    console.log(`An error occured when unbanning a user, error: ${error}`);
                }
            })

    },
    options: {
        userPermissions: [`BanMembers`],
        botPermissions: [`BanMembers`],
    },
} 