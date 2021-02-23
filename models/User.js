const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
	username: String,
	password: String,
	email: String,
	createdAt: String,
	devices: [
		{
			deviceId: String
		},
	],
});

module.exports = mongoose.model('User', userSchema);
