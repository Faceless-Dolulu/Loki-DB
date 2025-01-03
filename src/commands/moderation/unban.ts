import { SlashCommandProps } from "commandkit";
import { BaseGuildTextChannel, GuildMember, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import banLogsChannelSchema from '../../models/BanLogs.js'
import { fileURLToPath } from "url";
import { EmbedBuilder } from "@discordjs/builders";

export const data = new SlashCommandBuilder()
.setName('unban')
.setDescription('Unbans a user from this server.')
.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
.addUserOption((option) => 
option
.setName('user')
.setDescription('The user you want to unban.')
.setRequired(true))
.addStringOption((option) => 
    option
    .setName('reason')
    .setDescription('The reason for unbanning this user from this server.')
    .setRequired(true))
.setDMPermission(false);

export async function run ({ interaction, client, handler}: SlashCommandProps) {
    try {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || "No reason provided";

        const executor = interaction.member as GuildMember;

        await interaction.deferReply({ephemeral:true});

        const unBanLogMessage = new EmbedBuilder()
        .setColor(0x24e926)
        .setAuthor({name: `${interaction.user.username} (ID ${interaction.user.id})`, iconURL: interaction.user.displayAvatarURL()})
        //@ts-ignore
        .setThumbnail(targetUser?.displayAvatarURL())
        .addFields(
            {name: '\u200b', value: `:tools: **Unbanned** ${targetUser?.username} (ID ${targetUser?.id})`},
            {name: '\u200b', value: `:page_facing_up: **Reason:** ${reason}`}
        )
        .setTimestamp();
        
        

        await interaction.guild?.bans.fetch()
        .then(async bans => {
            if (bans.size == 0) {
                await interaction.followUp('❌ Nobody has been banned from this server yet!');
                return;
            }

            let bannedID = await bans.find(ban => ban.user.id == targetUser?.id);

            if (!bannedID) {
                await interaction.followUp("❌ This user hasn't been banned from this server.");
                return;
            }

            try{
                const banConfigs = await banLogsChannelSchema.find({
                guildId: executor.guild.id,
            });
            
            for (const banConfig of banConfigs) {
            const banLogChannel = executor.guild.channels.cache.get(banConfig.channelId) as BaseGuildTextChannel
                 ||
                  (await executor.guild.channels.fetch(banConfig.channelId)) as BaseGuildTextChannel;
                
        
                    banLogChannel.send({embeds: [unBanLogMessage]});
//@ts-ignore
                await interaction.guild?.bans.remove(targetUser, reason);
                await interaction.followUp(`<@${targetUser?.id}> has been unbanned.`);
                
        }} catch (error) {
            await interaction.followUp(`❌ I can't unban this user.`);
            console.log(`An error occured when unbanning a user, error: ${error}`);
        }})
    } catch (error) {
        console.log(`An error occured in ${fileURLToPath(import.meta.url)}:\n`, error)
    }
}