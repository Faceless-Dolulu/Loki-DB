import "dotenv/config";
import { Client, IntentsBitField, Partials } from "discord.js";
import path from "path";
import { CommandKit } from "commandkit";
import mongoose from "mongoose";

const client = new Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.MessageContent,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.GuildModeration,
		IntentsBitField.Flags.GuildPresences,
		IntentsBitField.Flags.GuildMessageReactions,
	],
	partials: [
		Partials.Channel,
		Partials.GuildMember,
		Partials.Message,
		Partials.Reaction,
	],
});
const __dirname = import.meta.dirname;

new CommandKit({
	client,
	commandsPath: path.join(__dirname, "commands"),
	eventsPath: path.join(__dirname, "events"),
	validationsPath: path.join(__dirname, "validations"),
	skipBuiltInValidations: false,
	devUserIds: ["306958469439684608"],
	devGuildIds: ["1306696123766931486"],
	bulkRegister: true,
});

mongoose.connect(String(process.env.DB_URL)).then(() => {
	console.log(`Connected to database.`);
	client.login(process.env.BOT_TOKEN);
});
