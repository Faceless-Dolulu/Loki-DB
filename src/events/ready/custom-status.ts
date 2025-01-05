import { CommandKit } from "commandkit";
import { ActivityType, Client } from "discord.js";

export default function (
	c: Client<true>,
	client: Client<true>,
	handler: CommandKit
) {
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
