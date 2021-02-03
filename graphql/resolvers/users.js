const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const { SECRET_KEY, ERROR_LOGIN, USER_NOT_FOUND, WRONG_PWD } = require('../../config');
const {
	validateRegisterInput,
	validateLoginInput,
} = require('../../util/validators');
const checkAuth = require('../../util/check-auth');

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
		 * @param {String} username = a username
		 * @param {String} password = user password
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
				devices:[],
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
		 * Registers new device for user if already logged in
		 *
		 * @param {String} deviceName
		 * @param {Context} context
		 * @throws {UserInputError}
		 */
		async registerNewDevice(_, { deviceName }, context) {
			const authUser = checkAuth(context);
			if (!authUser) {
				throw new UserInputError('User not logged in', {
					error: {
						deviceName:
							'This username is not logged in, please register new user first or try again',
					},
				});
			}
			if (deviceName.trim() === '') {
				throw new UserInputError('Empty device name', {
					errors: {
						body: 'Device name must not be empty',
					},
				});
			}
			console.log(authUser);
			const savedUser = await User.findById(authUser.id);
			console.log(savedUser);

			savedUser.devices.unshift({
				deviceName,
				createdAt: new Date().toISOString(),
			});
			await savedUser.save();
			//TODO: PUB SUB
			return savedUser.devices[0];
		},
	},
};
