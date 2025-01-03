import { GuildMember } from "discord.js";
import { model, Schema} from "mongoose";

const warnsSchema = new Schema({
    warnId: 
    {   type: String,
        unique: false
    },
    guildId:
    {
        type: String,
        required: true,
    },
    userId:
    {
        type: String,
        required: true,
    },
    reason:
    {
        type: String,
        default: 'No reason was provided.'
    },
    ModeratorID:
    {
        type: String,
        required: true,
    },
    ModeratorUsername:{
        type: String,
        required: true
    },
    TimeStamp:
    {
        type: Number,
        required: true,
    }
});

export default model('Warns', warnsSchema);
