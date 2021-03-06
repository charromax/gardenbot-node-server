const { AuthenticationError } = require('apollo-server');

const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

module.exports = (context) => {
	const authHeader = context.req.headers.authorization ? 
	context.req.headers.authorization : context.connection.context.authorization;
	if (authHeader) {
		//Bearer token
		const token = authHeader.split('Bearer ')[1];
		if (token) {
			try {
				const user = jwt.verify(token, SECRET_KEY);
				return user;
			} catch (err) {
				throw new AuthenticationError('Invalid/Expired token');
			}
		}
		throw new Error("Auth token must be in format 'Bearer [token]'");
	}
	throw new Error('Auth header must be provided');
};
