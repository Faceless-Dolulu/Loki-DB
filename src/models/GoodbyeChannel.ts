import { model, Schema } from "mongoose";

const goodbyeChannelSchema = new Schema({
    guildId:
    {
        type: String,
        required: true,
    },
    channelId:
    {
        type:String,
        required: true,
        unique: true,
    },
    customeMessage:
    {
        type: String, 
        default: null,
    },
}, { timestamps: true});

export default model('GoodbyeChannel', goodbyeChannelSchema);