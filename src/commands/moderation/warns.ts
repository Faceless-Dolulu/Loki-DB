import warnsSchema from "../../models/Warns.js";
import { SlashCommandProps, ButtonKit } from "commandkit";
import { Pagination } from "pagination.djs";
import {
	BaseGuildTextChannel,
	EmbedBuilder,
	GuildMember,
	GuildMemberRoleManager,
	InteractionContextType,
	SlashCommandBuilder,
} from "discord.js";
import warnLogsChannelSchema from "../../models/WarnLogs.js";
import { randomInt } from "crypto";
import { fileURLToPath } from "url";
import { deleteModel } from "mongoose";

export const data = new SlashCommandBuilder()
	.setName("warns")
	.setDescription(
		"Add/View/Edit/Delete/Clear warns of a particular user in this server."
	)
	.setContexts(InteractionContextType.Guild)
	.addSubcommand((command) =>
		command
			.setName("add")
			.setDescription("Add a warning to a user in this server.")
			.addUserOption((option) =>
				option
					.setName("user")
					.setDescription("The user you want to add a warn to.")
					.setRequired(true)
			)
			.addStringOption((option) =>
				option
					.setName("reason")
					.setDescription("The reason for warning the user.")
					.setMaxLength(512)
			)
	)
	.addSubcommand((command) =>
		command
			.setName("view")
			.setDescription("View the warn history of a user.")
			.addUserOption((option) =>
				option
					.setName("user")
					.setDescription("The user you want to check.")
					.setRequired(true)
			)
	)
	.addSubcommand((command) =>
		command
			.setName("edit")
			.setDescription(`Edit an issued warning's reason`)
			.addStringOption((option) =>
				option
					.setName("warn-id")
					.setDescription("The ID of the warning")
					.setRequired(true)
					.setMinLength(9)
					.setMaxLength(9)
			)
			.addStringOption((option) =>
				option
					.setName("new-reason")
					.setDescription("The new reason for the warning")
					.setRequired(true)
					.setMaxLength(512)
			)
	)
	.addSubcommand((command) =>
		command
			.setName("delete")
			.setDescription("Deletes a warn")
			.addStringOption((option) =>
				option
					.setName("warn-id")
					.setDescription("The ID of the warning")
					.setMaxLength(9)
					.setMinLength(9)
					.setRequired(true)
			)
			.addStringOption((option) =>
				option
					.setName("reason")
					.setDescription("The reason for deleting the warning")
					.setMaxLength(512)
			)
	)
	.addSubcommand((command) =>
		command
			.setName("clear")
			.setDescription("Clears user of all warnings")
			.addUserOption((option) =>
				option
					.setName("user")
					.setDescription("The user that the warnings belong to")
					.setRequired(true)
			)
			.addStringOption((option) =>
				option
					.setName("reason")
					.setDescription(`The reason for clearing all of the user's warnings`)
					.setMaxLength(512)
			)
	);

export async function run({ interaction, client, handler }: SlashCommandProps) {
	try {
		const subCommand = interaction.options.getSubcommand();

		if (subCommand === "add") {
			const targetMember = interaction.options.getMember("user") as GuildMember;
			const reason =
				interaction.options.getString("reason") || "No reason was provided";
			const targetUser = targetMember.user;

			const executor = interaction.member as GuildMember;
			const executorRoles = executor.roles as GuildMemberRoleManager;

			await interaction.deferReply({ ephemeral: true });

			if (targetUser.id === executor.id) {
				await interaction.followUp(
					`❌ You can't issue a warn against yourself!`
				);
				return;
			}
			if (!targetMember) {
				interaction.followUp(`❌ That user is not in this server.`);
				return;
			}

			const targetRolePosition = targetMember.roles.highest.position;
			const executorRolePosition = executorRoles.highest.position;

			if (targetRolePosition >= executorRolePosition) {
				await interaction.followUp(
					`❌ You can't issue a warn to a user with equal or higher roles!`
				);
				return;
			}

			const warnLogMessage = new EmbedBuilder()
				.setColor(0xd1d402)
				.setAuthor({
					name: `${executor.user.username} (ID ${executor.id})`,
					iconURL: executor.displayAvatarURL(),
				})
				.setThumbnail(targetUser.displayAvatarURL())
				.addFields(
					{
						name: "\u200b",
						value: `:warning: **Warned:** ${targetUser.username} (ID ${targetMember.id})`,
					},
					{ name: "\u200b", value: `:page_facing_up: **Reason:** ${reason}` }
				)
				.setTimestamp();
			let warnId = randomInt(1000000000).toLocaleString("en-us", {
				minimumIntegerDigits: 9,
				useGrouping: false,
			});
			let warnIdExists = await warnsSchema.exists({
				warnId: warnId,
				guildId: interaction.guildId,
			});
			do {
				warnId = randomInt(1000000000).toLocaleString("en-us", {
					minimumIntegerDigits: 9,
					useGrouping: false,
				});
				warnIdExists = await warnsSchema.exists({
					warnId: warnId,
					guildId: interaction.guildId,
				});
				console.log(warnId);
				if (!warnIdExists) break;
			} while (warnIdExists);

			const data = {
				warnId: warnId,
				guildId: interaction.guildId,
				userId: targetMember.id,
				reason: reason,
				ModeratorID: executor.id,
				ModeratorUsername: executor.user.username,
				TimeStamp: interaction.createdTimestamp,
			};

			const newWarn = new warnsSchema({
				...data,
			});

			newWarn.save().then(() => {
				console.log(
					`A new warning for ${targetUser.username} has been issued in ${targetMember.guild.name}`
				);
			});

			const warnConfigs = await warnLogsChannelSchema.find({
				guildId: targetMember.guild.id,
			});

			for (const warnConfig of warnConfigs) {
				const warnLogChannel =
					(interaction.guild?.channels.cache.get(
						warnConfig.channelId
					) as BaseGuildTextChannel) ||
					((await interaction.guild?.channels.fetch(
						warnConfig.channelId
					)) as BaseGuildTextChannel);

				warnLogChannel.send({ embeds: [warnLogMessage] });
				if (!targetUser.bot) {
					targetUser.send({
						embeds: [
							new EmbedBuilder()
								.setColor(0xd1d402)
								.addFields(
									{
										name: "\u200b",
										value: `:warning: You were **warned** in ${executor.guild.name}`,
									},
									{
										name: "\u200b",
										value: `:page_facing_up: **Reason:** ${reason}`,
									}
								)
								.setThumbnail(interaction.guild?.iconURL() || null),
						],
					});
				}

				interaction.followUp(
					`:tools: ${targetUser} has been warned | ${reason}`
				);
			}
		}
		if (subCommand === "view") {
			const targetMember = interaction.options.getMember("user") as GuildMember;
			const warnsArray: { name: string; value: string }[] = [];
			(
				await warnsSchema
					.find({ guildId: interaction.guildId, userId: targetMember.id })
					.lean()
			).forEach((warn) => {
				let warnId = warn.warnId;
				let reasons = warn.reason;
				let ModeratorId = warn.ModeratorID;
				let ModeratorUsername = warn.ModeratorUsername;
				let TimeStamp = warn.TimeStamp;
				warnsArray.push({
					name: `\u200b`,
					value: `#${warnId}: <t:${Math.floor(
						TimeStamp / 1000
					)}:f> - By: **${ModeratorUsername}** (${ModeratorId})\n**Reason:** ${reasons}`,
				});
			});

			if (warnsArray.length === 0) {
				interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTimestamp()
							.setTitle(
								`Warnings - User: ${targetMember.user.username} (ID ${targetMember.id})`
							)
							.setDescription(`**Total:** 0 `)
							.addFields({ name: "\u200b", value: `No Warnings` })
							.setColor(0xecc40f),
					],
				});
				return;
			}

			const pagination = new Pagination(interaction, { limit: 5, idle: 30000 })
				.setTitle(
					`Warnings - User: ${targetMember.user.username} (ID ${targetMember.id})`
				)
				.setDescription(`**Total:** ${warnsArray.length} `)
				.setColor(0xecc40f)
				.setFields(warnsArray);

			pagination.paginateFields();
			pagination.render();
		}
		if (subCommand === "delete") {
			await interaction.deferReply({ ephemeral: true });
			const warnId = interaction.options.getString("warn-id");
			const reason =
				interaction.options.getString("reason") || `No reason was provided.`;
			const warnConfigs = await warnLogsChannelSchema.find({
				guildId: interaction.guildId,
			});

			const query = {
				guildId: interaction.guildId,
				warnId: warnId,
			};

			const warnExistsInDb = await warnsSchema.exists(query);

			if (!warnExistsInDb) {
				interaction.followUp(`Warning ID is invalid. Please try again.`);
				return;
			}

			const warnsConfigs = await warnsSchema.findOne(query);

			const embed = new EmbedBuilder()
				.setAuthor({
					name: `${interaction.user.username} (ID ${interaction.user.id})`,
					iconURL: interaction.user.displayAvatarURL(),
				})
				.setTimestamp()
				.addFields(
					{
						name: "Warned User",
						value: `<@${warnsConfigs?.userId}>`,
						inline: true,
					},
					{
						name: "Warning Reason",
						value: `${warnsConfigs?.reason}`,
						inline: false,
					},
					{ name: "Reason for Deleting Warning", value: reason, inline: true }
				)
				.setColor(0xd2c30e)
				.setTitle("Warning Deleted");

			//Send Embed to Admin Only Log Channel
			for (const warnConfig of warnConfigs) {
				const adminLogChannel =
					(interaction.guild?.channels.cache.get(
						warnConfig.channelId
					) as BaseGuildTextChannel) ||
					((await interaction.guild?.channels.fetch(
						warnConfig.channelId
					)) as BaseGuildTextChannel);

				adminLogChannel.send({ embeds: [embed] });
			}

			warnsSchema.findOneAndDelete(query).then(() => {
				interaction.followUp(`✔ Warning deleted`).catch((error) => {
					interaction.followUp(`Database error. Please try again in a moment.`);
					console.log(
						`DB error in ${fileURLToPath(import.meta.url)}:\n`,
						error
					);
				});
			});
		}
		if (subCommand === "clear") {
			await interaction.deferReply({ ephemeral: true });
			const targetMember = interaction.options.getMember("user") as GuildMember;
			const reason =
				interaction.options.getString("reason") || "No reason was provided.";
			const warnConfigs = await warnLogsChannelSchema.find({
				guildId: interaction.guildId,
			});

			const warnsExistInDb = await warnsSchema.exists({
				guildId: interaction.guildId,
				userId: targetMember.id,
			});
			if (!warnsExistInDb) {
				interaction.followUp(
					`❌ This does not have a warn history in this server!`
				);
				return;
			}

			const adminEmbed = new EmbedBuilder()
				.setAuthor({
					name: `${interaction.user.username} (ID ${interaction.user.id})`,
					iconURL: interaction.user.displayAvatarURL(),
				})
				.setTimestamp()
				.addFields(
					{
						name: `\u200b`,
						value: `👌 **Cleared Warnings** ${targetMember.user.username} *(ID ${targetMember.id})*`,
					},
					{
						name: `\u200b`,
						value: `:page_facing_up: **Reason:** ${reason}`,
					}
				)
				.setColor(0x00ff00);

			await warnsSchema.deleteMany({
				guildId: interaction.guildId,
				userId: targetMember.id,
			});
			interaction.followUp(
				`All warns for ${targetMember.user.username} have been deleted!`
			);

			for (const warnConfig of warnConfigs) {
				const adminLogChannel =
					(interaction.guild?.channels.cache.get(
						warnConfig.channelId
					) as BaseGuildTextChannel) ||
					((await interaction.guild?.channels.fetch(
						warnConfig.channelId
					)) as BaseGuildTextChannel);

				adminLogChannel.send({ embeds: [adminEmbed] });
			}
		}
	} catch (error) {}
}
