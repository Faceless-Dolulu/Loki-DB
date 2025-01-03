import { EmbedBuilder } from "@discordjs/builders";
import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import banLogsChannelSchema from '../../models/BanLogs.js';
import { fileURLToPath } from "url";
export const data = new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bans a user from this server')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((option) => option
    .setName('user')
    .setDescription('The user you want to ban')
    .setRequired(true))
    .addStringOption((option) => option
    .setName('reason')
    .setDescription('The reason for banning this user from your server')
    .setRequired(true))
    .setDMPermission(false);
export async function run({ interaction, client, handler }) {
    try {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || "No reason provided";
        const targetMember = interaction.options.getMember('user');
        await interaction.deferReply({ ephemeral: true });
        const executor = interaction.member;
        const executorRoles = interaction.member?.roles;
        if (targetUser?.id === interaction.user.id) {
            await interaction.followUp("❌ You can't ban yourself!");
            return;
        }
        if (targetMember) {
            const targetUserRolePosition = targetMember.guild.roles.highest.position; //Highest role position of the target
            const requestUserRolePosition = executorRoles.highest.position; //Highest role position of the user inputting the ban command.
            if (targetUserRolePosition >= requestUserRolePosition) {
                await interaction.followUp("❌ You can't ban a user with equal or higher roles!");
                return;
            }
            if (!targetMember.bannable) {
                interaction.followUp('❌ This user cannot be banned!');
                return;
            }
        }
        if (reason.length > 512) {
            interaction.followUp('❌ The reason cannot be longer than 512 characters.');
            return;
        }
        const banLogMessage = new EmbedBuilder()
            .setColor(0xFF0000)
            .setAuthor({ name: `${interaction.user.username} (ID ${interaction.user.id})`, iconURL: interaction.user.displayAvatarURL() })
            //@ts-ignore
            .setThumbnail(targetUser?.displayAvatarURL())
            .addFields({ name: '\u200b', value: `:hammer: **Banned**:${targetUser} (ID ${targetUser?.id})` }, { name: '\u200b', value: `:page_facing_up: **Reason:** ${reason}` })
            .setTimestamp();
        const banConfigs = await banLogsChannelSchema.find({
            guildId: executor.guild.id,
        });
        for (const banConfig of banConfigs) {
            const banLogChannel = executor.guild.channels.cache.get(banConfig.channelId)
                ||
                    (await executor.guild.channels.fetch(banConfig.channelId));
            banLogChannel.send({ embeds: [banLogMessage] });
            if (!targetUser.bot) {
                targetUser?.send({ embeds: [new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setDescription(`
                🔨 you were **banned** from ${interaction.guild?.name} \n
                📄 **Reason:** ${reason}`)
                            .setThumbnail(interaction.guild?.iconURL({}))
                    ] });
            }
            interaction.followUp(`:hammer: ${targetUser} has been banned!`);
            executor.guild.bans.create(targetUser.id, { reason: reason });
        }
    }
    catch (error) {
        console.log(`Error in ${fileURLToPath(import.meta.url)}:\n`, error);
    }
}
export const options = {
    userPermissions: [`BanMembers`],
    botPermissions: ['BanMembers']
};
