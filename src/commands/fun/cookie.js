const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cookie')
        .setDescription('Gives a user a cookie.')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('The member you want to give a cookie to')
                .setRequired(true)),
    run: async ({ interaction, client, handler }) => {
        const targetUserId = await interaction.options.get('member');

        const gifs = [
            "https://media.tenor.com/gOp22b-UIj8AAAAM/cookie-sendcookie.gif",
            "https://media.tenor.com/Xs9WfI-5cm4AAAAM/you-get-a-cookie-ricky-berwick.gif",
            "https://media.tenor.com/nKziPLT44JEAAAAM/greys-anatomy-andrew-deluca.gif",
            "https://media.tenor.com/YBclaql8X7YAAAAM/cookies-enjoy.gif",
            "https://media.tenor.com/AL2oNCXDvqEAAAAM/oprah-cookie.gif",
            "https://media.tenor.com/j2KwN5-ehG4AAAAM/make-it-rain-cookies.gif"
        ];

        const selfGifs = [
            "https://media.tenor.com/FDHHFVsVzcEAAAAM/damn-emoji.gif",
                    "https://media.tenor.com/BkgZIBPMzIYAAAAj/bubu-eating.gif",
                    "https://media.tenor.com/ZrhR2IrP52gAAAAM/eating-a-cookie-ricky-berwick.gif",
                    "https://media.tenor.com/3zFbEZVoImAAAAAM/yum-yummy.gif",
                    "https://media.tenor.com/kihD0lwCptsAAAAM/yoshi-cookies.gif",
        ];

        let selectedGif =  Math.floor(Math.random() * gifs.length);
        let selectedSelfGif =  Math.floor(Math.random() * selfGifs.length);

        const targetUser =  await interaction.guild.members.fetch(targetUserId)
            .then(console.log).catch(console.error);

        const embed = await new EmbedBuilder()
            .setDescription(`${targetUser}, you received a cookie from ${interaction.member}!`);

        if (!targetUser) {
            await interaction.reply({ content: `This user is not a member of this server`, ephemeral: true });
            return;
        }

        //Gives cookie to the target user

        try {
            if (interaction.member === targetUser) {
                embed.setDescription(`${interaction.member} gave themselves a cookie!`);
                embed.setImage(selfGifs[selectedSelfGif]);
            }
            else {
                embed.setImage(gifs[selectedGif]);
            }

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.log(`There was an error when using this emote: ${error}`);
        }


    },
}