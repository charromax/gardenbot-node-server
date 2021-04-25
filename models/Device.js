const mongoose = require('mongoose');

const deviceSchema = mongoose.Schema({
	deviceName: String,
	createdAt: { type: String, default: new Date().toISOString() },
	isActivated: { type: Boolean, default: false },
});

module.exports = mongoose.model('Device', deviceSchema);
