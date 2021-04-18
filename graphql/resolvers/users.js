const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
	UserInputError,
	transformSchema,
	AuthenticationError,
} = require('apollo-server');

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

const decodeToken = require('../../util/decode-token');

function generateToken(user, type = 'access') {
	const expiration = type === 'access' ? '1d' : '7d';
	return jwt.sign(
		{
			id: user.id,
			username: user.username,
			count: user.count,
		},
		SECRET_KEY,
		{ expiresIn: expiration }
	);
}

module.exports = {
	Query: {
		async refreshToken(_, __, context) {
			//validate incoming token
			//decode user data and check against db
			//issue new token

			try {
				const { id, username, count } = decodeToken(context);
				const user = await User.findById(id);

				console.log("user: " + user);
				console.log("validateUser: " + username + count);

				if (
					user.username === username &&
					user.count === count
				) {
					user.count++;
					const savedUser = await user.save()
					const token = generateToken(savedUser);
					console.log("generated token");
					return token;
				} else {
					throw new Error("Token data doesn't match user");
				}
			} catch (error) {
				console.log(error);
				throw new Error('Invalid token, please login again');
			}
		},
	},
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
			// Reset token count

			const { valid, errors } = validateLoginInput(username, password);
			if (!valid) {
				throw new UserInputError(ERROR_LOGIN, { errors });
			}

			const user = await User.findOne({ username }).populate('devices');
			if (!user) {
				errors.general = USER_NOT_FOUND;
				throw new UserInputError(USER_NOT_FOUND, { errors });
			}
			const match = await bcrypt.compare(password, user.password);
			if (!match) {
				errors.general = WRONG_PWD;
				throw new UserInputError(WRONG_PWD, { errors });
			}
			user.count = 0
			const savedUser = await user.save()
			console.log(savedUser)
			const accessToken = generateToken(savedUser);
			return {
				...savedUser._doc,
				id: savedUser._id,
				token: accessToken
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
		}
	}
};
