const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
	createdAt: { type: String, default: new Date().toISOString() },
	deviceId: String,
	code: Number,
	message: String,
});

module.exports = mongoose.model('Notification', notificationSchema);
