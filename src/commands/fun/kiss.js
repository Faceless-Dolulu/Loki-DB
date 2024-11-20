const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder} = require('discord.js');


module.exports = {
    callback: async (client, interaction) => {
        const targetUserId = interaction.options.get('target-user').value;

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

        const targetUser = await interaction.guild.members.fetch(targetUserId);
        const embed = new EmbedBuilder()
            .setDescription(`${interaction.member} kissed ${targetUser}!`);

        if (!targetUser) {
            await interaction.editReply("That user is not a member of this server.");
            return;
        }

        // kisses the user
        try{
            if (interaction.member === targetUser) {
                embed.setDescription(`${interaction.member} is kissing themself!`);
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
    name: 'kiss',
    description: 'Kisses a user',
    options:[
        {
            name: 'target-user',
            description: 'The user you want to kiss.',
            required: true,
            type: ApplicationCommandOptionType.User
        }
    ],

}