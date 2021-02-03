const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
	body: String,
	createdAt: String,
	username: String,
	comments: [
		{
			body: String,
			username: String,
			createdAt: String,
		},
	],
	likes: [
		{
			username: String,
			createdAt: String,
		},
	],
	user: {
		type: mongoose.Schema.Types.ObjectID,
		ref: "users",
	},
});

module.exports = mongoose.model("Post", postSchema);
