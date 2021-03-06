/*
 * Created on Sun Feb 28 2021
 *
 * Copyright (c) 2021 charr0max -> manuelrg88@gmail.com
 */

const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
	username: String,
	password: String,
	email: String,
	createdAt: String,
	devices: [String],
	count: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', userSchema);