const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder} = require('discord.js');


module.exports = {
    callback: async (client, interaction) => {
        const targetUserId = interaction.options.get('target-user').value;

        await interaction.deferReply();
        const gifs = [
            "https://media.tenor.com/MrhME3n9Z2UAAAAM/dungeong.gif",
            "https://media.tenor.com/KC56LsHlsY0AAAAM/cats-cat-slap.gif",
            "https://media.tenor.com/smDvEFaac-cAAAAM/peach-goma-slapping.gif",
            "https://media.tenor.com/QRdCcNbk18MAAAAM/slap.gif",
            "https://media.tenor.com/eU5H6GbVjrcAAAAM/slap-jjk.gif",
            "https://media.tenor.com/E3OW-MYYum0AAAAM/no-angry.gif",
            "https://media.tenor.com/zXqvIewp3ToAAAAM/asobi-asobase.gif"
        ];
        let selectedGif = Math.floor(Math.random() * gifs.length);

        const targetUser = await interaction.guild.members.fetch(targetUserId);
        const embed = new EmbedBuilder()
            .setDescription(`${interaction.member} slapped ${targetUser}!`);

        if (!targetUser) {
            await interaction.editReply("That user is not a member of this server.");
            return;
        }

        if (interaction.member === targetUser) {
            embed.setDescription(`${interaction.member}, you can't slap yourself!`);
        }
        // Slaps the user
        try{
            embed.setImage(gifs[selectedGif]);
            await interaction.followUp({ embeds: [embed] });
        } catch (error) {
            console.log(`There was an error when using this emote: ${error}`);

        }
    },
    name: 'slap',
    description: 'Slaps a user',
    options:[
        {
            name: 'target-user',
            description: 'The user you want to slap.',
            required: true,
            type: ApplicationCommandOptionType.User
        }
    ],

}