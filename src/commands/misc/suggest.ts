import { SlashCommandProps } from "commandkit";
import {
	ActionRowBuilder,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	SlashCommandBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import suggestionChannelSchema from "../../models/SuggestionsChannel.js";

export const data = new SlashCommandBuilder()
	.setName("suggest")
	.setDescription("Make a suggestion");

export async function run({ interaction, client, handler }: SlashCommandProps) {
	const suggestionsConfigured = suggestionChannelSchema.exists({
		guildId: interaction.guildId,
	});
	if (!suggestionsConfigured) {
		interaction.reply({
			content: `Suggestions haven't been enabled in this server.`,
		});
	}

	const modal = new ModalBuilder()
		.setCustomId("Suggestion")
		.setTitle("Suggestion");

	const suggestionInput = new TextInputBuilder()
		.setCustomId("suggestionInput")
		.setLabel("Your Suggestion:")
		.setStyle(TextInputStyle.Paragraph)
		.setRequired(true)
		.setPlaceholder("Insert suggestion here...");

	const suggestion =
		new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
			suggestionInput
		);

	modal.addComponents(suggestion);

	await interaction.showModal(modal);
}
