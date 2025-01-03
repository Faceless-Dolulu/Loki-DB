import { model, Schema } from "mongoose";

const starboardChannelSchema = new Schema(
	{
		guildId: {
			type: String,
			required: true,
			unique: true,
		},
		channelId: {
			type: String,
			required: true,
			unique: true,
		},
		reactionCount: {
			type: Number,
			required: true,
		},
		emoji: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

export default model("StarBoard", starboardChannelSchema);
