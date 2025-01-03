import { model, Schema } from "mongoose";

const suggestionChannelSchema = new Schema({
	guildId: {
		type: String,
		required: true,
		uniwue: true,
	},
	channelId: {
		type: String,
		required: true,
		unique: true,
	},
});

export default model("SuggestionsChannel", suggestionChannelSchema);
