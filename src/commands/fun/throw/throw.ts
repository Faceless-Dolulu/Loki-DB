import { SlashCommandProps } from "commandkit";
import { SlashCommandBuilder } from "discord.js";
import { objects, randomObject } from "./throwable-objects.js";

export const data = new SlashCommandBuilder()
	.setName("throw")
	.setDescription(`Throwing things is fun`)
	.addUserOption((option) =>
		option
			.setName("target")
			.setDescription("The user you want to throw things at.")
			.setRequired(false)
	);

export async function run({ interaction, client, handler }: SlashCommandProps) {
	try {
		const target =
			interaction.options.getUser("target")?.displayName ||
			`a random person nearby`;

		const rng = Math.floor(Math.random() * 100);

		if (rng < 5) {
			interaction.reply(
				`TRIPLE THROW!! Threw **${randomObject()}**, **${randomObject()}**, and **${randomObject()}** at **${target}**`
			);
		}
		if (rng < 15) {
			interaction.reply(
				`DOUBLE THROW! Threw **${randomObject()}**, and **${randomObject()}** at **${target}**`
			);
		} else {
			interaction.reply(`Threw **${randomObject()}** at **${target}**`);
		}
	} catch (error) {}
}
