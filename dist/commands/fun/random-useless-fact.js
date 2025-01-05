import { EmbedBuilder, InteractionContextType, SlashCommandBuilder, } from "discord.js";
import { request } from "undici";
export const data = new SlashCommandBuilder()
    .setName("useless-fact")
    .setDescription("Generates a random useless fact")
    .setContexts(InteractionContextType.Guild);
export async function run({ interaction, client, handler }) {
    try {
        await interaction.deferReply();
        const randomUselessFactResult = await request(`https://uselessfacts.jsph.pl/api/v2/facts/random`);
        const channel = interaction.channel;
        //@ts-ignore
        const list = await randomUselessFactResult.body.json();
        const embed = new EmbedBuilder()
            //@ts-ignore
            .setDescription(`${list.text}`)
            .setColor("Random")
            .setFooter({ text: `Source: djtech.net` })
            .setTimestamp();
        interaction.followUp({ embeds: [embed] });
    }
    catch (error) {
        console.log(error);
    }
}
