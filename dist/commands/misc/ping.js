export const data = {
    name: 'ping',
    description: 'Shows the ping for Faceless Canary'
};
export async function run({ interaction, client, handler }) {
    await interaction.deferReply();
    const reply = await interaction.fetchReply();
    const ping = reply.createdTimestamp - interaction.createdTimestamp;
    interaction.followUp(`<:ping:1311370925173641377> Client ping is ${ping}ms | Websocket ping is ${client.ws.ping}ms`);
}
