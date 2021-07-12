const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
	createdAt: String,
	deviceId: String,
	code: Number,
	message: String,
});

module.exports = mongoose.model('Notification', notificationSchema);
