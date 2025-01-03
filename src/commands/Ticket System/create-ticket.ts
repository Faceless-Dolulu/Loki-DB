import { CommandOptions, SlashCommandProps } from "commandkit";
import {
	ChannelType,
	EmbedBuilder,
	InteractionContextType,
	PermissionFlagsBits,
	PermissionOverwrites,
	SlashCommandBuilder,
} from "discord.js";
import { fileURLToPath } from "url";

export const data = new SlashCommandBuilder()
	.setName("create-ticket")
	.setDescription("Opens a ticket between you and server staff.")
	.setContexts(InteractionContextType.Guild)
	.addStringOption((option) =>
		option
			.setName("reason")
			.setDescription("The reason for opening a ticket")
			.setRequired(true)
	)
	.addBooleanOption((option) =>
		option
			.setName("admin-only")
			.setDescription(
				"Sets whether the ticket opened is only viewable to server Admins"
			)
			.setRequired(true)
	);

export async function run({ interaction, client, handler }: SlashCommandProps) {
	try {
		const reason = interaction.options.getString("reason");

		await interaction.deferReply({ ephemeral: true });

		const openingMessage = new EmbedBuilder()
			.setColor(0xc6d11a)
			.setDescription(
				`Thank you for opening a ticket. Please include all information relevant to this ticket (ex. evidence of rules being violated). \n \n A staff member will respond to your ticket at their earliest convenience.`
			);

		await interaction.guild?.channels.fetch();

		const category = await interaction.guild?.channels.cache.find(
			(c) => c.name === `Tickets` && c.type === ChannelType.GuildCategory
		);

		if (!category) {
			interaction.guild?.channels.create({
				name: "Tickets",
				type: ChannelType.GuildCategory,
			});
		}
		// TO DO: Create schema that hosts array of all role IDs that are considered moderators and Admins to ensure they automatically get access to the channel
		const ticketChannel = await interaction.guild?.channels.create({
			name: interaction.user.username,
			type: ChannelType.GuildText,
			permissionOverwrites: [
				{
					id: interaction.guild.id,
					deny: [PermissionFlagsBits.ViewChannel],
				},
				{
					id: interaction.user.id,
					allow: [
						PermissionFlagsBits.ViewChannel,
						PermissionFlagsBits.SendMessages,
					],
				},
			],
		});

		if (category && ticketChannel) {
			ticketChannel.setParent(category.id);
		}

		interaction.followUp("🛠 A ticket has been opened!");
		ticketChannel?.send({ embeds: [openingMessage] });
		ticketChannel?.send(`||${interaction.user}||`);
	} catch (error) {
		console.log(`Error in ${fileURLToPath(import.meta.url)}: \n`, error);
	}
}
export const options: CommandOptions = {
	deleted: true,
};
