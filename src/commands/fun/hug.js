const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder} = require('discord.js');


module.exports = {
    callback: async (client, interaction) => {
        const targetUserId = interaction.options.get('target-user').value;

        await interaction.deferReply();
        const gifs = [
            "https://media.tenor.com/40yKTjst1T4AAAAj/bunny-hug-rabbit-hug.gif",
            "https://media.tenor.com/SG2Y2dkZvqoAAAAM/ori.gif",
            "https://media.tenor.com/n9C4G-QEsrcAAAAM/squeeze-hug.gif",
            "https://media.tenor.com/DRgXad_JuuQAAAAM/bobitos-mimis.gif",
            "https://media.tenor.com/1BuQnijeXv0AAAAM/hug.gif",
            "https://media.tenor.com/dJaIvlOAlGMAAAAM/hug.gif"
        ];
        const selfGifs = [
            "https://media.tenor.com/3qIaljIZUYMAAAAM/brendon-urie-panic-at-the-disco.gif",
            "https://media.tenor.com/kkW-x5TKP-YAAAAM/seal-hug.gif",
            "https://media.tenor.com/BJ4FJrBw_7MAAAAM/oxabi-self-hug.gif"
        ];
        let selectedGif = Math.floor(Math.random() * gifs.length);
        let selectedSelfGif = Math.floor(Math.random() * selfGifs.length);

        const targetUser = await interaction.guild.members.fetch(targetUserId);
        const embed = new EmbedBuilder()
            .setDescription(`${interaction.member} hugged ${targetUser}!`);

        if (!targetUser) {
            await interaction.editReply("That user is not a member of this server.");
            return;
        }

        // hugs the user
        try{
            if (interaction.member === targetUser) {
                embed.setDescription(`${interaction.member} is hugging themself!`);
                embed.setImage(selfGifs[selectedSelfGif]);
            }
            else{
                embed.setImage(gifs[selectedGif]);
            }
            await interaction.followUp({ embeds: [embed] });
        } catch (error) {
            console.log(`There was an error when using this emote: ${error}`);

        }
    },
    name: 'hug',
    description: 'Hugs a user',
    options:[
        {
            name: 'target-user',
            description: 'The user you want to hug.',
            required: true,
            type: ApplicationCommandOptionType.Mentionable
        }
    ],
}