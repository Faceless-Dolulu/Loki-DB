import { SlashCommandBuilder } from "discord.js";
import topics from "./topics.js";
export const data = new SlashCommandBuilder()
    .setName("topic")
    .setDescription("Generates a conversation topic to help get chat moving.");
export async function run({ interaction, client, handler }) {
    const selectedTopic = topics[Math.floor(Math.random() * topics.length)];
    interaction.reply(selectedTopic);
}
