const mongoose = require('mongoose');

const measureSchema = mongoose.Schema({
	createdAt: String,
	deviceId: String,
	airTemp: Number,
	airHum: Number,
	soilHum: Number,
	username: String,
	user: {
		type: mongoose.Schema.Types.ObjectID,
		ref: "users",
	},
});

module.exports = mongoose.model('Measure', measureSchema);
