import { ActivityType, PresenceUpdateStatus, type Client } from "discord.js";
import type { CommandKit } from "commandkit";

export default function (
	c: Client<true>,
	client: Client<true>,
	handler: CommandKit
) {
	console.log(`${c.user.username} is ready!`);

	client.user.setPresence({
		activities: [
			{
				name: `over ${client.guilds.cache.size} servers.`,
				type: ActivityType.Watching,
			},
		],
		status: PresenceUpdateStatus.Online,
	});
}
