import { CommandData, SlashCommandProps } from "commandkit";

export const data: CommandData = {
    name: 'ping',
    description: 'Shows the ping for Faceless Canary'
}

export  async function run({ interaction, client, handler}: SlashCommandProps) {
    await interaction.deferReply();
    const reply = await interaction.fetchReply();
    const ping = reply.createdTimestamp - interaction.createdTimestamp;

    interaction.followUp(`<:ping:1311370925173641377> Client ping is ${ping}ms | Websocket ping is ${client.ws.ping}ms`);
}
