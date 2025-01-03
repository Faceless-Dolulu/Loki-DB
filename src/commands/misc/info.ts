import { SlashCommandProps } from "commandkit";
import {
	ActivityType,
	BaseGuildTextChannel,
	ChannelType,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js";
import { fileURLToPath } from "url";

export const data = new SlashCommandBuilder()
	.setName("info")
	.setDescription("Provides info about the server")
	.setDMPermission(false)
	.addSubcommand((subcommand) =>
		subcommand
			.setName("user")
			.setDescription("Provides info about a user.")
			.addUserOption((option) =>
				option
					.setName("user")
					.setDescription("The user you want to run the command on.")
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName("server")
			.setDescription("Provides info about the server.")
	);

export async function run({ interaction, client, handler }: SlashCommandProps) {
	try {
		const subCommand = interaction.options.getSubcommand();
		const channel = interaction.channel as BaseGuildTextChannel;
		await interaction.deferReply();

		if (subCommand === "server") {
			await interaction.guild?.fetch();
			const MemberCount = interaction.guild?.memberCount;
			const serverName = interaction.guild?.name as string;
			const serverOwner = await interaction.guild?.fetchOwner();
			const serverCreationDate = new Date(
				interaction.guild?.createdTimestamp as number
			);
			const categoryChannels = interaction.guild?.channels.cache.filter(
				(channel) => channel.type == ChannelType.GuildCategory
			).size as number;
			const textChannels = interaction.guild?.channels.cache.filter(
				(channel) => channel.type == ChannelType.GuildText
			).size as number;
			const announcementChannels = interaction.guild?.channels.cache.filter(
				(channel) => channel.type == ChannelType.GuildAnnouncement
			).size as number;
			const voiceChannels = interaction.guild?.channels.cache.filter(
				(channel) => channel.type == ChannelType.GuildVoice
			).size as number;
			const stageVoiceChannels = interaction.guild?.channels.cache.filter(
				(channel) => channel.type == ChannelType.GuildStageVoice
			).size as number;
			const forumChannels = interaction.guild?.channels.cache.filter(
				(channel) => channel.type == ChannelType.GuildForum
			).size as number;
			const privateThreadChannels = interaction.guild?.channels.cache.filter(
				(channel) => channel.type == ChannelType.PrivateThread
			).size as number;
			const publicThreadChannels = interaction.guild?.channels.cache.filter(
				(channel) => channel.type == ChannelType.PublicThread
			).size as number;

			const serverIcon = interaction.guild?.iconURL();
			const thumbnail = interaction.guild?.iconURL() || "";

			const textTotal = textChannels + announcementChannels;
			const voiceTotal = voiceChannels + stageVoiceChannels;
			const threadTotal =
				forumChannels + privateThreadChannels + publicThreadChannels;

			const serverInfo = new EmbedBuilder()
				.setAuthor({ name: serverName, iconURL: serverIcon || undefined })
				.setThumbnail(thumbnail)
				.addFields(
					{
						name: "Owner",
						value: `${serverOwner?.user.username}`,
						inline: true,
					},
					{ name: "Members", value: `${MemberCount}`, inline: true },
					{
						name: "Category Channels",
						value: `${categoryChannels}`,
						inline: true,
					},
					{ name: "Text Channels", value: `${textTotal}`, inline: true },
					{ name: "Voice Channels", value: `${voiceTotal}`, inline: true },
					{ name: "Threads", value: `${threadTotal}`, inline: true }
				)
				.setColor(0x00b8c7)
				//@ts-ignore
				.setFooter({
					text: `ID: ${
						interaction.guild?.id
					} | Server Creation: ${serverCreationDate.getUTCFullYear()}/${serverCreationDate.getMonth()}/${serverCreationDate.getDate()}`,
				});

			interaction.followUp({ embeds: [serverInfo] });
		}

		if (subCommand === "user") {
			const targetUser =
				(await interaction.options.getUser("user")) || interaction.user;

			const member = await interaction.guild?.members.cache.get(targetUser.id);

			const memberJoinDate = member?.joinedTimestamp;
			const memberId = targetUser.id;
			const memberAvatar = targetUser.displayAvatarURL();
			const memberAccountCreationDate = member?.user.createdTimestamp;
			const memberStatus = member?.presence?.activities.find(
				(a) => a.type === ActivityType.Custom
			)?.state;

			const colour = member?.displayHexColor || 0x00b8c7;

			const userInfo = new EmbedBuilder()
				.setTitle(`${member?.user.username}`)
				.addFields(
					{ name: "ID", value: memberId, inline: true },
					{ name: "Avatar", value: `[Link](${memberAvatar})`, inline: true },
					{
						name: "Account Created",
						//@ts-ignore
						value: `<t:${parseInt(memberAccountCreationDate / 1000)}:R>`,
					},

					{
						name: "Joined Server",
						//@ts-ignore
						value: `<t:${parseInt(memberJoinDate / 1000)}:R>`,
						inline: true,
					},
					{ name: "Status", value: `Custom Status: ${memberStatus}` }
				)
				.setThumbnail(memberAvatar)
				.setTimestamp()
				.setColor(colour);

			interaction.followUp({ embeds: [userInfo] });
		}
	} catch (error) {
		console.log(`Error in ${fileURLToPath(import.meta.url)}: \n`, error);
	}
}
