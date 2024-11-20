const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    callback: async (clinet, interaction) => {
        const targetUserId = interaction.options.get('target-user').value;

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
        const targetUser = await interaction.guild.members.fetch(targetUserId);

        const embed = new EmbedBuilder()
            .setDescription(`${interaction.member} shot ${targetUser}!!`);

        if (!targetUser) {
            await interaction.followUp({ content: 'That user is not a member of this server.', ephemeral: true });
            return;
        }

        // "shoots" the user

        try {
            if (interaction.member === targetUser) {
                embded.setDescription(`You can't do that ${interaction.member}, love yourself!`);
            }
            else {
                embed.setImage(gifs[selectedGif]);
            }

            await interaction.followUp({ embeds: [embed] });

        } catch (error) {
            console.log(`There was an error when using this emote: ${error}`);

        }
    },

    name: 'shoot',
    description: '"Shoots" a user',
    options: [
        {
            name: 'target-user',
            description: 'The user you want to shoot',
            required: true,
            type: ApplicationCommandOptionType.User
        }
    ],
}