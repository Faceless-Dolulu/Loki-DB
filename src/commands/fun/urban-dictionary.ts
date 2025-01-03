import { SlashCommandProps } from "commandkit";
import {
	BaseGuildTextChannel,
	ChannelType,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js";
import { Pagination } from "pagination.djs";
import { request } from "undici";
import { URLSearchParams } from "url";

export const data = new SlashCommandBuilder()
	.setName("urban")
	.setDescription("Looks up the definition for a word on urban dictionary")
	.addStringOption((option) =>
		option
			.setName("query")
			.setDescription("The word/phrase that you want to search a definition of")
			.setRequired(true)
	);
export async function run({ interaction, client, handler }: SlashCommandProps) {
	try {
		await interaction.deferReply();
		const term = interaction.options.getString("query") as string;
		const query = new URLSearchParams({ term });

		const urbanDictionaryResult = await request(
			`https://api.urbandictionary.com/v0/define?${query}`
		);
		//@ts-ignore
		const { list } = await urbanDictionaryResult.body.json();
		const channel = interaction.channel as BaseGuildTextChannel;
		if (!channel.nsfw) {
			interaction.followUp(
				"Sorry, Urban Dictionary can break Discord TOS. Please try using this command again inside an NSFW channel. 🙃 "
			);
			return;
		}

		if (!list.length) {
			const embed = new EmbedBuilder()
				.setColor(0x1abaf1)
				.setTitle(`${term}`)
				.setDescription(`No results were found.`);
			return;
		}
		const embeds = [];
		const trim = (string: String, max: number) =>
			string.length > max ? `${string.slice(0, max - 3)}...` : string;
		for (let i = 0; i <= 4; i++) {
			if (!list[i]) break;

			const newEmbed = new EmbedBuilder()
				.setColor(0x1abaf1)
				.setTitle(list[i].word)
				.setURL(list[i].permalink)
				.addFields(
					{ name: "Defintion", value: `${trim(list[i].definition, 1024)}` },
					{ name: `Example`, value: `${trim(list[i].example, 1024)}` },
					{
						name: "Rating",
						value: `${list[i].thumbs_up} thumbs up.\n${list[i].thumbs_down} thumbs down.`,
					}
				);
			embeds.push(newEmbed);
		}
		// Idle is set to 2 minutes
		const pagination = new Pagination(interaction, {
			idle: 120000,
			loop: true,
		}).setEmbeds(embeds);

		pagination.render();
	} catch (error) {
		interaction.followUp(
			"An error occured. Please try again later. If the error persists, please make a ticket in the Support server."
		);
	}
}
