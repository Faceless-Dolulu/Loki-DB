const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hug')
        .setDescription('Gives a user a hug')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('The member you want to give a hug')
                .setRequired(true)),
    run: async ({ interaction, client, handler }) => {
        const targetUserId = interaction.options.get('member').value;

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
        let selectedSelfGif = Math.floor(Math.random() * gifs.length);

        const targetUser = await interaction.guild.members.fetch(targetUserId)
            .then(console.log).catch(console.error);

        const embed = new EmbedBuilder()
            .setDescription(`${targetUser} recieved a hug from ${interaction.member}!`)
            .setImage(gifs[selectedGif]);

        if (!targetUser) {
            await interaction.followUp({ content: `That user is not a member of this server`, ephemeral: true });
            return;
        }

        try {
            if (interaction.member === targetUser) {
                embed.setDescription(`${interaction.member} gave themselves a hug!`);
                embed.setImage(selfGifs[selectedSelfGif]);
            }
            await interaction.followUp({ embeds: [embed] });
        } catch (error) {
            console.log(`There was an error when using this emote: ${error}`);
        }
    },
}