const mongoose = require('mongoose');

const measureSchema = mongoose.Schema({
	createdAt: String,
	deviceId: String,
	airTemp: Number,
	airHum: Number,
	soilHum: Number,
});

module.exports = mongoose.model('Measure', measureSchema);
