const mongoose = require('mongoose');

const measureSchema = mongoose.Schema({
	createdAt: { type: String, default: new Date().toISOString() },
	deviceId: String,
	airTemp: Number,
	airHum: Number,
	soilHum: Number,
});

module.exports = mongoose.model('Measure', measureSchema);
