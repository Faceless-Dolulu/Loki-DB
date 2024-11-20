const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    callback: async (client, interaction) => {
        const targetUserId = interaction.options.get('target-user').value;

        await interaction.deferReply();

        const gifs = [
            "https://media.tenor.com/gOp22b-UIj8AAAAM/cookie-sendcookie.gif",
            "https://media.tenor.com/Xs9WfI-5cm4AAAAM/you-get-a-cookie-ricky-berwick.gif",
            "https://media.tenor.com/nKziPLT44JEAAAAM/greys-anatomy-andrew-deluca.gif",
            "https://media.tenor.com/YBclaql8X7YAAAAM/cookies-enjoy.gif",
            "https://media.tenor.com/AL2oNCXDvqEAAAAM/oprah-cookie.gif",
            "https://media.tenor.com/j2KwN5-ehG4AAAAM/make-it-rain-cookies.gif"
        ];

        let selectedGif = Math.floor(Math.random() * gifs.length);

        const targetUser = await interaction.guild.members.fetch(targetUserId);
        const embed = new EmbedBuilder()
            .setDescription(`${targetUser}, you recieved a cookie from ${interaction.member}!`);

        if (!targetUser) {
            await interaction.followUp({ content: 'That user is not a member of this server', ephemeral: true });
            return;
        }

        // Gives cookie to the target user
        try {
            if (interaction.member === targetUser) {
                embed.setDescription(`${interaction.member} gave themselves a cookie!`);
            }

            embed.setImage(gifs[selectedGif]);

            await interaction.followUp({ embeds: [embed] });
        } catch (error) {
            console.log(`There was an error when using this emote: ${error}`);
        }
    },
    name: 'cookie',
    description: 'Gives a user a cookie',
    options:[
        {
            name: 'target-user', 
            description: 'The user you want to give a cookie to.',
            required: true,
            type: ApplicationCommandOptionType.User
        }
    ],
}