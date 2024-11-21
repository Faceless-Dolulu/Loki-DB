const { SlashCommandBuilder, PermissionsFlagsBits } = require('discord.js');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeouts a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to timeout')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for issuing a timeout against this user')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Timeout duration (30m, 1h, 1day')
                .setRequired(true)),

    run: async ({ interaction, client, handler }) => {
        const targetUserId = interaction.options.get('user').value;
        const reason = await interaction.options.get('reason').value;
        const duration = await interaction.options.get('duration').value;
        const targetUser = await interaction.guild.members.fetch(targetUserId);

        if (!targetUser) {
            interaction.reply({ content: `This user is not a member of this server.`, ephemeral: true });
            return;
        }

        if (targetUser.user.bot) {
            await interaction.reply({ content: `I can't timeout a bot.`, ephemeral: true });
            return;
        }

        //converts human readabe duration to bot readable duration
        const msDuration = ms(duration);
        if (isNaN(msDuration)) {
            await interaction.reply({ content: `Please provide a valid timeout duration.`, ephemeral: true });
            return;
        }

        if (msDuration < 5000 || msDuration > 2.519e9) {
            await interaction.reply({ content: `Timeout duration cannot be less than 5 seconds or more than 28 days`, ephemeral: true });
            return;
        }

        if (targetUser.id === interaction.guild.ownerId) {
            await interaction.reply({ content: `You can't timeout that user because they are the server owner.`, ephemeral: true });
            return;
        }

        const targetUserRolePostion = await targetUser.roles.highest.position; // Higherst role of the target user
        const requestUserRolePostion = await interaction.member.roles.highest.position; // Highest role of the command initiator
        const botRolePosition = await interaction.guild.members.me.roles.highest.position; //Highest role of the bot

        if (targetUserRolePostion >= botRolePosition) {
            await interaction.reply({ content: `I cannot ban that user because they have the same or higher role than me.`, ephemeral: true });
            return;
        }

        if (targetUserRolePostion >= requestUserRolePostion) {
            await interaction.reply({ content: `You cannot timeout that user because they have the same or higher role than you.`, ephemeral: true });
            return;
        }

        try {
            const { default: prettyMs } = await import('pretty-ms');
            if (targetUser.isCommunicationDisabled()) {
                await targetUser.send(`Your timeout in **${interaction.guild.name}** has been updated to: Duration: ${prettyMs(msDuration, { verbose: true })} \nReason: ${reason}`);
                await targetUser.timeout(msDuration, reason);
                await interaction.reply({ content: `${targetUser}'s timeout has been updated to ${prettyMs(msDuration, { verbose: true })}`, ephemeral: true });
                return;
            }
            await targetUser.send(`You have been timed out in **${interaction.guild.name}**. \nReason: ${reason}`);
            await targetUser.timeout(msDuration, reason);
            await interaction.reply({ content: `${targetUser} has been timed out for ${prettyMs(msDuration, { verbose: true })}`, ephemeral: true });
        } catch (error) {
            console.log(`An error occured when timing out: ${error}`);
        }
    },
    options: {
        userPermissions: [`MuteMembers`],
        botPermissions: [`MuteMembers`],
    },


};