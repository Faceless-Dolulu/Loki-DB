import { ActivityType } from "discord.js";
export default function (c, client, handler) {
    setInterval(() => {
        console.log(client.guilds.cache.size);
        client.user.setPresence({
            activities: [
                {
                    name: `Chilling In ${client.guilds.cache.size} Servers!`,
                    type: ActivityType.Custom,
                },
            ],
        });
    }, 60000);
}
