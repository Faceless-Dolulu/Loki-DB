import { CommandOptions, SlashCommandProps } from "commandkit";
import { BaseGuildTextChannel, EmbedBuilder, GuildMember, GuildMemberRoleManager, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import ms from "ms";
import timeoutLogsChannelSchema from '../../models/TimeOutLogs.js';
import prettyMilliseconds from "pretty-ms";

export const data = new SlashCommandBuilder()
.setName('timeout')
.setDescription('Timeouts a user')
.setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
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
        .setRequired(true));

        export async function run ({ interaction, client, handler}: SlashCommandProps) {
            try{
            const targetUser = interaction.options.getMember('user') as GuildMember;
            const reason = interaction.options.getString('reason') || "No reason provided";
            const duration = await interaction.options.getString('duration');

            await interaction.deferReply({ephemeral:true});
            //@ts-ignore
            const msDuration = ms(duration);
            if (isNaN(msDuration)) {
                await interaction.followUp('Please provide a valid timout duration');
                return;
            }

            if (msDuration < 5000 || msDuration > 2.519e9) {
                await interaction.followUp( `Timeout duration cannot be less than 5 seconds or more than 28 days`);
                return;
            }

            const executorRoles = interaction.member?.roles as GuildMemberRoleManager;

            if (!targetUser) {
                await interaction.followUp('❌ User is not in this server!');
                return;
            }
            if (targetUser.id === interaction.user.id) {
                await interaction.followUp("❌ You can't timeout yourself!");
                return;
             }   

             if (targetUser.user.bot) {
                interaction.followUp("I can't timeout a bot.");
                return;
             }
             
             const targetUserRolePosition = targetUser?.roles.highest.position; //Highest role position of the target
            const requestUserRolePosition = executorRoles.highest.position; //Highest role position of the user inputting the ban command.
             
            if (targetUserRolePosition >= requestUserRolePosition) {
                await interaction.followUp("❌ You can't ban a user with equal or higher roles!")
                return; 
                }   
            
                if (!targetUser.bannable) {
                interaction.followUp('❌ This user cannot be banned!')
                return;
                }
            
                if (reason.length > 512) {
                interaction.followUp('❌ The reason cannot be longer than 512 characters.');
                return;
                }

                const timeoutLogMessage = new EmbedBuilder()
                .setColor(0xE9E212)
                .setAuthor({name: `${interaction.user.username} (ID ${interaction.user.id})`, iconURL: interaction.user.displayAvatarURL()})
                .setThumbnail(targetUser.user.displayAvatarURL())
                .addFields(
                    {name: '\u200b', value: `:mute: **Timed Out** ${targetUser.user.username} (ID ${targetUser.user.id})`},
                    {name: '\u200b', value: `:page_facing_up: **Reason:** ${reason}`},
                    {name: '\u200b', value: `:stopwatch: **Duration:** ${prettyMilliseconds(msDuration, {verbose: true})}`}
                )
                .setTimestamp()

                const timeoutConfigs = await timeoutLogsChannelSchema.find({
                    guildId: targetUser.guild.id,
                });
                
                for (const timeoutConfig of timeoutConfigs) {
                    const timeoutLogChannel = targetUser.guild.channels.cache.get(timeoutConfig.channelId) as BaseGuildTextChannel
                    ||
                    (await targetUser.guild.channels.fetch(timeoutConfig.channelId)) as BaseGuildTextChannel;
                    
                    if (targetUser.isCommunicationDisabled()) {
                        await targetUser.send(`**${targetUser.guild.name}:** ${targetUser}, your ⏱️ Timeout duration has been updated to ${prettyMilliseconds(msDuration, {verbose: true})}\n
                        **Reason:** ${reason}`);
                        await targetUser.timeout(msDuration, reason);
                        await interaction.followUp(`${targetUser}'s timeout has been updated to ${prettyMilliseconds(msDuration, {verbose: true})}`);
                        timeoutLogMessage.setDescription(`🔇**Timeout Updated for** ${targetUser} (ID ${targetUser.user.id})\n
                           📄 **Reason:** ${reason}\n
                           ⏱️ **Duration:** ${prettyMilliseconds(msDuration, {verbose: true})}`)
                        timeoutLogChannel.send({embeds: [timeoutLogMessage]})
                        return;
                    }

                    await targetUser.send(`**${targetUser.guild.name}:** ${targetUser}, you have been ⏱️ Timed Out for ${prettyMilliseconds(msDuration, {verbose: true})}\n
                    **Reason:** ${reason}`);
                    await targetUser.timeout(msDuration, reason);
                    await interaction.followUp(`${targetUser} has been timed out for ${prettyMilliseconds(msDuration, {verbose: true})}`);
                    timeoutLogChannel.send({embeds: [timeoutLogMessage]});

                }
            } catch (error) {
                console.log(`an error occured in ${__filename}:\n`, error);
            }

         }
         export const options: CommandOptions = {
            botPermissions: ["MuteMembers"]
         }