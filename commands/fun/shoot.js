const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shoot')
        .setDescription('"shoots" a user.')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('The member you want to "shoot"')
                .setRequired(true)),
    run: async ({ interaction, client, handler }) => {
        const targetUserId = interaction.options.get('member').value;

        await interaction.deferReply();

        const gifs = [
            "https://media.tenor.com/5LQFz4CpTmsAAAAM/pull-the-trigger-fire.gif",
            "https://media.tenor.com/-WsYZiKzOQEAAAAM/gun.gif",
            "https://media.tenor.com/n96t0fQk9-IAAAAM/gun-shooting.gif",
            "https://media.tenor.com/VB0BfGA7neYAAAAM/fat-guy-shooting.gif",
            "https://media.tenor.com/Vja2MkojIgsAAAAM/anime-gun.gif",
            "https://media.tenor.com/iMtcqbBzc5sAAAAM/anime-shooting.gif"
        ];

        let selectedGif = Math.floor(Math.random() * gifs.length);
        

        const targetUser = await interaction.guild.members.fetch(targetUserId)
            .then(console.log).catch(console.error);

        const embed = new EmbedBuilder()
            .setDescription(`${interaction.member} is shooting ${targetUser}!!!`);
            

        if (!targetUser) {
            await interaction.followUp({ content: `That user is not a member of this server`, ephemeral: true });
            return;
        }

        //Gives cookie to the target user

        try {
            if (interaction.member === targetUser) {
                embed.setDescription(`${interaction.member}, let's not do that. <3'`);
                
            }
            else {
                embed.setImage(gifs[selectedGif]);
            }

            await interaction.followUp({ embeds: [embed] });
        } catch (error) {
            console.log(`There was an error when using this emote: ${error}`);
        }


    },
}