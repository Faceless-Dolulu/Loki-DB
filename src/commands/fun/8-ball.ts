import { SlashCommandProps } from "commandkit";
import {
	EmbedBuilder,
	InteractionContextType,
	SlashCommandBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
	.setName("8-ball")
	.setDescription("Ask the magic 8-ball a question")
	.addStringOption((option) =>
		option
			.setName("question")
			.setDescription("Your question for the magic 8-ball")
			.setRequired(true)
	)
	.setContexts(InteractionContextType.Guild);

export async function run({ interaction, client, handler }: SlashCommandProps) {
	const question = interaction.options.getString("question");
	const answers = [
		"It is certain",
		"It is decidedly so",
		"Without a doubt",
		"Yes, definitely",
		"You may rely on it",
		"As I see it, yes",
		"Most likely",
		"Outlook good",
		"Yes",
		"Signs point to yes",
		"Reply hazy try again",
		"Ask again later",
		"Better not tell you now",
		"Cannot predict now",
		"Concentrate and ask again",
		"Don't count on it",
		"My reply is no",
		"My sources say no",
		"Outlook not so good",
		"Very doubtful",
	];

	const embed = new EmbedBuilder().setColor("Random").setFields(
		{ name: `Question`, value: question as string },
		{
			name: `Answer`,
			value: `${answers[Math.floor(Math.random() * answers.length)]}`,
		}
	);

	interaction.reply({ embeds: [embed] });
}
