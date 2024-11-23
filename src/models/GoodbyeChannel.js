const { Schema, model } = require('mongoose');

const goodbyeChannelSchema = new Schema({
    guildId:
    {
        type: String,
        required: true,
    },
    channelId:
    {
        type: String,
        required: true,
        unique: true,
    },
    customeMessage:
    {
        type: String,
        default: null,
    },
},
    { timestamps: true }
);

module.exports = model('GoodbyeChannel', goodbyeChannelSchema);