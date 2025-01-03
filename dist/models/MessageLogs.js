import { Schema, model } from "mongoose";
const messageLogsChannelSchema = new Schema({
    guildId: {
        type: String,
        required: true,
        unique: true,
    },
    channelId: {
        type: String,
        required: true,
        unique: true,
    }
}, { timestamps: true });
export default model('messageLogs', messageLogsChannelSchema);
