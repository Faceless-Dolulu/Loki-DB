const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`slap`)
        .setDescription(`Slaps a user`)
        .addUserOption(option => 
            option.setName(`member`)
                .setDescription(`The member you want to slap`)
                .setRequired(true)),

    run: async ({ interaction, client, handler }) => {
        const targetUserId = interaction.options.get('member').value;

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

        const targetUser = await interaction.guild.members.fetch(targetUserId)
            .then(console.log).catch(console.error);

        const embed = new EmbedBuilder()
            .setDescription(`${interaction.member} slapped ${targetUser}!`);

        if (!targetUser) {
            await interaction.followUp({ content: `That user is not a member of this server`, ephemeral: true });
            return;
        }

        try {
            if (interaction.member === targetUser) {
                embed.setDescription(`You can't slap yourself ${interaction.member}!`);
            }
            else {
                embed.setImage(gifs[selectedGif]);
            }

            await interaction.followUp({ embeds: [embed] });
        } catch (error) {
            console.log(`There was an error using this emote: ${error}`);
        }
    },
}