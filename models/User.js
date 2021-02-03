const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
	username: String,
	password: String,
	email: String,
	createdAt: String,
	devices: [
		{
			createdAt: String,
			deviceName: String,
		},
	],
});

module.exports = mongoose.model('User', userSchema);
