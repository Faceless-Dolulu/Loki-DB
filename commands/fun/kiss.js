const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kiss')
        .setDescription('Gives a user a smooch')
        .addUserOption( option =>
    option.setName('member')
        .setDescription('The member you want to smooch')
                .setRequired(true)),
    run: async ({ interaction, client, handler }) => {
        const targetUserId = interaction.options.get('member').value;
        await interaction.deferReply();

        const gifs = [
            "https://media.tenor.com/4j4UT0-4xTMAAAAM/peach-and-goma.gif",
            "https://media.tenor.com/gRnRdgBucm8AAAAM/puuung-kiss-puuung.gif",
            "https://media.tenor.com/qvutZGFdbfAAAAAM/puuung-infinite-kisses.gif",
            "https://media.tenor.com/OByUsNZJyWcAAAAM/emre-ada.gif",
            "https://media.tenor.com/NZUQilMD3IIAAAAM/horimiya-izumi-miyamura.gif",
            "https://media.tenor.com/YHxJ9NvLYKsAAAAM/anime-kiss.gif"
        ];

        const selfGifs = [
            "https://media.tenor.com/0-ZcXybzvIgAAAAM/edoardo-esposito-valerio-mazzei.gif",
            "https://media.tenor.com/3BMRCVepIa8AAAAM/vanity-smurf-youre-so-vain.gif",
            "https://media.tenor.com/vDBq87_u7AwAAAAM/billie-eilish-drawingcircles.gif",
            "https://media.tenor.com/RUBvK3Ln2sMAAAAM/sarahmcfadyen-lewis-capaldi.gif"
        ];

        let selectedGif = Math.floor(Math.random() * gifs.length);
        let selectedSelfGif = Math.floor(Math.random() * selfGifs.length);

        const targetUser = await interaction.guild.members.fetch(targetUserId)
            .then(console.log).catch(console.error);

        const embed = new EmbedBuilder()
            .setDescription(`${interaction.member} kissed ${targetUser}!! \n\n Get a room you guys...`)
            .setImage(gifs[selectedGif]);

        if (!targetUser) {
            await interaction.followUp({ content: `That user is not a member of this server`, ephemeral: true });
            return;
        }
        try {
            if (interaction.member === targetUser) {
                embed.setDescription(`${interaction.member} is kissing themself!`);
                embed.setImage(selfGifs[selectedSelfGif]);
            }

            await interaction.followUp({ embeds: [embed] });
        } catch (error) {
            console.log(`There was an error when using this emote: ${error}`);
        }
    }
}