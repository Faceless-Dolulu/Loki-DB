const { Client, IntentsBitField } = require('discord.js');
const mongoose = require('mongoose');
require('dotenv').config();
const { CommandKit } = require('commandkit');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
    ],
});

new CommandKit({
    client,
    devGuildIds: ['1306696123766931486'],
    devUserIds: ['306958469439684608'],
    eventsPath: `${__dirname}/events`,
    commandsPath: `${__dirname}/commands`,
    bulkRegister: true,
    validationsPath: `${__dirname}/validations`,
    skipBuiltInValidations: false,

});
client.login(process.env.BOT_TOKEN);



