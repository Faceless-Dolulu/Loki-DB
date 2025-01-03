import welcomeChannelSchema from '../../models/WelcomeChannel.js';
export default async (guildMember) => {
    try {
        const welcomeConfigs = await welcomeChannelSchema.find({
            guildId: guildMember.guild.id,
        });
        if (!welcomeConfigs.length)
            return;
        for (const welcomeConfig of welcomeConfigs) {
            const welcomeChannel = guildMember.guild.channels.cache.get(welcomeConfig.channelId)
                ||
                    (await guildMember.guild.channels.fetch(welcomeConfig.channelId));
            if (!welcomeChannel) {
                welcomeChannelSchema.findOneAndDelete({
                    guildId: guildMember.guild.id,
                    channelId: welcomeConfig.channelId,
                }).catch(() => { });
            }
            const customMessage = welcomeConfig.customMessage ||
                `👋 Hey {mention-member}! Welcome to {server-name}`;
            const welcomeMessage = customMessage
                .replace('{mention-member}', `<@${guildMember.id}>`)
                .replace('{username}', guildMember.user.username)
                .replace('{server-name}', guildMember.guild.name);
            welcomeChannel.send(welcomeMessage).catch(() => { });
        }
    }
    catch (error) {
    }
};
