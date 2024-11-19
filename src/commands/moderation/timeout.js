const { ApplicationCommandOptionType, PermissionFlagsBits, Client, Interaction } = require('discord.js');
const ms = require('ms');
module.exports = {
    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     */
    callback: async (client, interaction) => {
        const mentionable = interaction.options.get('target-user').value;
        const duration = interaction.options.get('duration').value;
        const reason = interaction.options.get('reason').value;

        

        const targetUser = await interaction.guild.members.fetch(mentionable);

        if (!targetUser) {
            await interaction.reply("That user doesn't exist in this server");
            return;
        }

        if (targetUser.user.bot) {
            await interaction.reply("I can't timeout a bot.");
            return;
        }

      // converts human readable duration to bot readable duration
        const msDuration = ms(duration);
        if (isNaN(msDuration)) {
            await interaction.reply("Please provide a valid timeout duration.");
            return;
        }

        if (msDuration < 5000 || msDuration > 2.419e9 ) {
            await interaction.reply("Timeout duration cannot be less than 5 seconds or more than 28 days");
            return;
        }

        const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of the target user
        const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of the user running the command
        const botRolePosition = interaction.guild.members.me.roles.highest.position; //Highest role of the bot

        if(targetUserRolePosition >= requestUserRolePosition) {
            await interaction.reply("You can't timeout that user because they have the same or higher role than you.");
            return;
        }
        if(targetUserRolePosition >= botRolePosition) {
            await interaction.reply("I can't timeout that user because they have the same or higher role than me.");
            return;
        }
        // Timeout the user

        try {
            const { default: prettyMs } = await import('pretty-ms');
            await interaction.deleteReply;
            if (targetUser.isCommunicationDisabled()) {
                await targetUser.send(`Your timeout in **${interaction.guild.name}** has been updated to: Duration: ${prettyMs(msDuration, { verbose: true })} \nReason: ${reason}`);
                await targetUser.timeout(msDuration, reason);
                await interaction.reply({content: `${targetUser}'s timeout has been updated to ${prettyMs(msDuration, { verbose: true })}`, ephemeral: true });
                return;
            }
            await targetUser.send(`You have been timed out in **${interaction.guild.name}** \nReason: ${reason} \nDuration: ${prettyMs(msDuration, { verbose: true })}`);
            await targetUser.timeout(msDuration, reason);
            await interaction.reply({ content: `${targetUser} has been timed out for ${prettyMs(msDuration, { verbose: true })}`,  ephemeral: true });
        } catch (error) {
            console.log(`There was an error when timing out: ${error}`);
        }
    },

    name: 'timeout',
    description: `Timeout a user`,
    options: [
        {
            name: 'target-user',
            description: 'The user to timeout',
            type: ApplicationCommandOptionType.Mentionable,
            required: true,
        },
        {
            name: 'duration',
            description: 'Timeout duration (30m, 1h, 1day).',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'reason',
            description: 'The reason for the timeout.',
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ],
    permissionsRequired: [PermissionFlagsBits.MuteMembers],
    botPermissions: [PermissionFlagsBits.MuteMembers],

}