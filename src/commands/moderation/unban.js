const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

module.exports = {
	callback: async (client, interaction) => {
		const targetUserId = interaction.options.get('target-user').value;
		const reason = interaction.options.get('reason').value;

		await interaction.guild.bans.fetch()
			.then(async bans => {
				if (bans.size == 0) {
					await interaction.reply({ content: `Nobody has been banned from this server yet!`, ephemeral: true });
					return;
				}
				let bannedID = bans.find(ban => ban.user.id == targetUserId);
				if (!bannedID) {
					await interaction.reply({ content: `This user has not been banned from this server`, ephemeral: true });
					return;
				}

				try {
					await interaction.guild.bans.remove(targetUserId, reason);
					await interaction.reply({ content: `<@${targetUserId}> has been unbanned. \nReason: ${reason}`, ephemeral: true });
				} catch (error) {
					await interaction.reply({ content: `I cannot ban this user`, ephemeral: true });
					console.log(`An error occured when unbanning a user, error: ${error}`);
				}
			})
	},

	name: 'unban',
	description: 'Unbans a user from this server',
	options: [
		{
			name: 'target-user',
			description: 'The user to unban. Accepts User ID or User Mention',
			required: true, 
			type: ApplicationCommandOptionType.User,
		},
		{
			name: 'reason',
			description: 'The reason for unbanning this user.',
			required: true,
			type: ApplicationCommandOptionType.String,
		}
	],
	permissionsRequired: [PermissionFlagsBits.BanMembers],
	botPermissions: [PermissionFlagsBits.BanMembers],
}