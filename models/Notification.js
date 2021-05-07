const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
	createdAt: { type: String, default: new Date().toISOString() },
	deviceId: String,
	type: String,
	priority: String,
	message: String,
});

module.exports = mongoose.model('Notification', notificationSchema);
