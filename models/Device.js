const mongoose = require('mongoose');

const deviceSchema = mongoose.Schema({
	deviceName: String,
	createdAt: String,
});

module.exports = mongoose.model('device', deviceSchema);
