import { SlashCommandProps } from "commandkit";
import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import goodbyeChannelSchema from '../../models/GoodbyeChannel.js';
import { fileURLToPath } from "url";

export const data = new SlashCommandBuilder()
.setName('goodbye-setup')
.setDescription('Setup a channel to send goodbye messages to.')
.setDMPermission(false)
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
.addChannelOption(option => 
    option
    .setName('target-channel')
    .setDescription('The channel to send welcome messages in.')
    .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
    .setRequired(true)
)
.addStringOption(option =>
    option
    .setName('custom-message')
    .setDescription('TEMPLATES {mention-member} {username}')
);

export async function run({interaction, client, handler}: SlashCommandProps) {
    try {
        const goodbyeChannel = interaction.options.getChannel('target-channel');
        const customMessage = interaction.options.getString('custom-message');

        await interaction.deferReply({ephemeral: true});

        const query = {
            guildId: interaction.guildId,
            channelId: goodbyeChannel?.id,
        };

        const channelExistsInDb = await goodbyeChannelSchema.exists(query);

        if (channelExistsInDb) {
            interaction.followUp('This channel has already benn configured for goodbye messages.');
            return;
        }

        const newGoodbyeChannel = new goodbyeChannelSchema({
            ...query,
            customMessage,
        });

        newGoodbyeChannel.save()
        .then(()=>{
            interaction.followUp(`Configured ${goodbyeChannel} to receive goodbye messages.`);
        }).catch((error) => {
            interaction.followUp('Database error. Please try again in a moment');
            console.log(`DB error in ${fileURLToPath(import.meta.url)}: \n`, error);
        })
        
    } catch (error) {
        console.log(`Error in ${fileURLToPath(import.meta.url)}:\n`, error);
    }
    
}