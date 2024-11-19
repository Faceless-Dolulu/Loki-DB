const {Client, IntentsBitField} = require('discord.js');
require('dotenv').config();
const eventHandler = require('./handlers/eventHandler');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
    ],
});

eventHandler(client);

client.login(process.env.BOT_TOKEN);