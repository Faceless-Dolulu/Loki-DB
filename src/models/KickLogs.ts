import { model, Schema } from "mongoose"

const kickLogsChannelSchema = new Schema({
    guildId:
    {
        type:String,
        required: true,
        unique: true,
    },
    channelId:
    {
        type: String,
        required: true,
        unique: true,
    }
}, {timestamps: true});

export default model('KickLogs', kickLogsChannelSchema);