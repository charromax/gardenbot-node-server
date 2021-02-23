const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError, transformSchema } = require('apollo-server');

const {
	SECRET_KEY,
	ERROR_LOGIN,
	USER_NOT_FOUND,
	WRONG_PWD,
} = require('../../config');
const {
	validateRegisterInput,
	validateLoginInput,
} = require('../../util/validators');
const checkAuth = require('../../util/check-auth');
const Device = require('../../models/Device');

function generateToken(user) {
	return jwt.sign(
		{
			id: user.id,
			email: user.email,
			username: user.username,
		},
		SECRET_KEY,
		{ expiresIn: '1h' }
	);
}

module.exports = {
	Mutation: {
		/**
		 * User login
		 * @param {String} username a username
		 * @param {String} password user password
		 * @throws {UserInputError}
		 */
		async login(_, { username, password }) {
			// Validate user input
			// Check users existance
			// Compare passwords

			const { valid, errors } = validateLoginInput(username, password);
			if (!valid) {
				throw new UserInputError(ERROR_LOGIN, { errors });
			}

			const user = await User.findOne({ username });
			if (!user) {
				errors.general = USER_NOT_FOUND;
				throw new UserInputError(USER_NOT_FOUND, { errors });
			}
			const match = await bcrypt.compare(password, user.password);
			if (!match) {
				errors.general = WRONG_PWD;
				throw new UserInputError(WRONG_PWD, { errors });
			}
			const token = generateToken(user);
			return {
				...user._doc,
				id: user._id,
				token,
			};
		},

		/**
		 * Register new user
		 * @param {registerInput} = username, email, password and password confirmation
		 * @throws {UserInputError}
		 */
		async register(
			_,
			{ registerInput: { username, email, password, confirmPassword } }
		) {
			// Validate user data
			// Make sure user doesn't already exist
			// Hash password and create auth token

			const { valid, errors } = validateRegisterInput(
				username,
				email,
				password,
				confirmPassword
			);
			if (!valid) {
				throw new UserInputError('Errors', { errors });
			}

			const user = await User.findOne({ username });
			if (user) {
				throw new UserInputError('Username is taken', {
					error: {
						username: 'This username is taken',
					},
				});
			}

			password = await bcrypt.hash(password, 12);

			const newUser = new User({
				email,
				username,
				password,
				devices: [],
				createdAt: new Date().toISOString(),
			});

			const res = await newUser.save();
			const token = generateToken(res);

			return {
				...res._doc,
				id: res._id,
				token,
			};
		},

		/**
		 * Registers new device
		 *
		 * @param {String} deviceName
		 * @throws {UserInputError}
		 */
		async registerNewDevice(_, { deviceName }) {
			if (deviceName.trim() === '') {
				throw new UserInputError('Empty device name', {
					errors: {
						body: 'Device name must not be empty',
					},
				});
			}
			const device = new Device({
				deviceName: deviceName,
				createdAt: new Date().toISOString(),
			});

			const newDevice = await device.save();
			return newDevice._id;
		},

		/**
		 * Activates a newly registered device
		 * 
		 * @param {String} deviceName: device S/N as printed in box 
		 * @param {String} userId: valid registered user id 
		 * @param {Context} context: requires Token
		 */
		async activateDevice(_, { deviceName, userId }, context) {
			if (deviceName.trim() === '') {
				throw new UserInputError('Empty device name', {
					errors: {
						body: 'Device name must not be empty',
					},
				});
			}
			const validateUser = checkAuth(context);
			const device = Device.findOne({ deviceName });
			if (device && validateUser) {
				const user = await User.findById(userId);
				if (user) {
					user.devices.unshift(device.id);
				}
				const res = await user.save();
				return device;
			} else {
				throw new Error('Invalid device name or user')
			}
		},
	},
	Subscription: {
		newDevice: {
			subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_DEVICE'),
		},
	},
};
