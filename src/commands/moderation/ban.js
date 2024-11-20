const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     */
    callback: async (client, interaction) => {
        const targetUserId = interaction.options.get('target-user').value;
        const reason = interaction.options.get('reason').value;

        await interaction.deferReply();

       

        const targetUser = await interaction.guild.members.fetch(targetUserId);

        if (!targetUser) {
            await interaction.editReply("That user is not a current member of this server.");
            return;
        }

        if (targetUser.id === interaction.guild.ownerId) {
            await interaction.editReply("You can't ban that user because they're the server owner.");
            return;
        }

        const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of the target user
       const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of the user running the command
       const botRolePosition = interaction.guild.members.me.roles.highest.position; //Highest role of the bot

        if(targetUserRolePosition >= requestUserRolePosition) {
            await interaction.editReply("You can't ban that user because they have the same or higher role than you.");
            return;
        }
        if(targetUserRolePosition >= botRolePosition) {
            await interaction.editReply("I can't ban that user because they have the same or higher role than me.");
            return;
        }

        // Bans the targetUser
        try {
            await targetUser.send(`You have been banned from **${interaction.guild.name}** \nReason: ${reason}`);
            await targetUser.ban({reason});
            await interaction.editReply(`User ${targetUser} was banned \n Reason: ${reason}`);
         } catch (error) {
            console.log(`There was an error when banning: ${error}`);
         }

    },
    name:'ban',
    description: 'Bans a member from this server.',
    //devOnly: Boolean
    //TestOnly: Boolean
    options: [
        {
            name: 'target-user',
            description: 'The user to ban. Accepts User ID or User Mention',
            required: true,
            type: ApplicationCommandOptionType.User
        },
        {
            name: 'reason',
            description: 'The reason for banning',
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ],
    permissionsRequired: [PermissionFlagsBits.BanMembers],
    botPermissions: [PermissionFlagsBits.BanMembers],
}