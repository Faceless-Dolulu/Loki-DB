import { CommandOptions, SlashCommandProps } from "commandkit";
import { ChannelType, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
.setName('close-ticket')
.setDescription('Closes the ticket')
.setDMPermission(false)
.addStringOption((option)=>
option
.setName('reason')
.setDescription('The reason for closing the ticket')
.setRequired(true));

export async function run ({interaction, client, handler}: SlashCommandProps) {
    try {
        const reason = await interaction.options.getString('reason');

        await interaction.deferReply({ephemeral: true});

        await interaction.guild?.channels.fetch();

        const category = await interaction.guild?.channels.cache.find(c => c.name === `Tickets` && c.type === ChannelType.GuildCategory);

        if (!category) {
            interaction.followUp('A ticketing System has not been set up yet!');
            return;
        }

        const ticketChannel = await interaction.guild?.channels.cache.find( t=> t === interaction.channel);
        
        if (ticketChannel?.parentId !== category.id) {
            interaction.followUp('This channel is not a ticket Channel');
            return;
        }
        
        let messages = [];

        let message = await ticketChannel.messages
        .fetch({limit: 1})
        .then(messagePage => (messagePage.size === 1 ? messagePage.at(0) : null));

        while (message) {
            await ticketChannel.messages 
            .fetch({ limit: 100, before: message.id })
            .then(messagePage => {
              messagePage.forEach(msg => messages.push(msg));
              message = 0 < messagePage.size ? messagePage.at(messagePage.size -1) : null;
        }) 
     };      
    }

     catch (error) {
        
    }
}
export const options: CommandOptions = {
    deleted: true
 }
