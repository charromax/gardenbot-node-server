/*
 * Created on Sun Feb 28 2021
 *
 * Copyright (c) 2021 charr0max -> manuelrg88@gmail.com
 */

const mongoose = require('mongoose');
const Device = require('./Device');

const userSchema = mongoose.Schema({
	username: String,
	password: String,
	email: String,
	createdAt: { type: String, default: new Date().toISOString() },
	devices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' }],
	count: { type: Number, default: 0 },
});

module.exports = mongoose.model('User', userSchema);
