const mongoose = require('mongoose');

const DeviceSchema = mongoose.Schema({
	deviceName: String,
	createdAt: String,
});

module.exports = mongoose.model('device', deviceSchema);
