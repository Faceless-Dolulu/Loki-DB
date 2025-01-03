import { EmbedBuilder } from "@discordjs/builders";
import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import kickLogsChannelSchema from '../../models/KickLogs.js';
import { fileURLToPath } from "url";
export const data = new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from this server')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(option => option
    .setName('user')
    .setDescription('The user you want to kick')
    .setRequired(true))
    .addStringOption(option => option
    .setName('reason')
    .setDescription('The reason for banning this user from your server')
    .setRequired(true))
    .setDMPermission(false);
export async function run({ interaction, client, handler }) {
    try {
        const targetUser = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || "no reason provided";
        await interaction.deferReply({ ephemeral: true });
        const executorRoles = interaction.member?.roles;
        if (!targetUser) {
            await interaction.followUp('❌ user is not in this server! ');
            return;
        }
        if (targetUser.id === interaction.user.id) {
            await interaction.followUp("❌ You can't kick yourself!");
            return;
        }
        const targetUserRolePosition = targetUser?.roles.highest.position; //Highest role position of the target
        const requestUserRolePosition = executorRoles.highest.position; //Highest role position of the user inputting the ban command.
        if (targetUserRolePosition >= requestUserRolePosition) {
            await interaction.followUp("❌ You can't kick a user with equal or higher roles!");
            return;
        }
        if (!targetUser.kickable) {
            interaction.followUp('❌ This user cannot be kicked!');
            return;
        }
        if (reason.length > 512) {
            interaction.followUp('❌ The reason cannot be longer than 512 characters.');
            return;
        }
        const kickLogMessage = new EmbedBuilder()
            .setColor(0xe27104)
            .setAuthor({ name: `${interaction.user.username} (ID ${interaction.user.id})`, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(targetUser.user.displayAvatarURL())
            .addFields({ name: '\u200b', value: `:boot: **Kicked:** ${targetUser} (ID ${targetUser.user.id})` }, { name: '\u200b', value: `:page_facing_up: **Reason:** ${reason}` })
            .setTimestamp();
        const kickConfigs = await kickLogsChannelSchema.find({
            guildId: targetUser.guild.id,
        });
        for (const kickConfig of kickConfigs) {
            const kickLogChannel = targetUser.guild.channels.cache.get(kickConfig.channelId)
                ||
                    (await targetUser.guild.channels.fetch(kickConfig.channelId));
            if (!kickLogChannel) {
                kickLogsChannelSchema.findOneAndDelete({
                    guildId: targetUser.guild.id,
                    ChannelId: kickConfig.channelId,
                }).catch(() => { });
                targetUser?.send({ embeds: [new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setDescription(`
                        🥾 you were **kicked** from ${interaction.guild?.name} \n
                        📄 **Reason:** ${reason}`)
                            .setThumbnail(interaction.guild?.iconURL({}))
                    ] }).catch();
                interaction.followUp(`🥾 ${targetUser} has been kicked!`);
                targetUser.kick();
                return;
            }
            kickLogChannel.send({ embeds: [kickLogMessage] });
            targetUser?.send({ embeds: [new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setDescription(`
                🥾 you were **kicked** from ${interaction.guild?.name} \n
                📄 **Reason:** ${reason}`)
                        .setThumbnail(interaction.guild?.iconURL({}))
                ] }).catch();
            interaction.followUp(`🥾 ${targetUser} has been kicked!`);
            targetUser.kick();
        }
    }
    catch (error) {
        console.log(`Error in ${fileURLToPath(import.meta.url)}:\n`, error);
    }
}
export const options = {
    userPermissions: [`KickMembers`],
    botPermissions: ['KickMembers']
};
