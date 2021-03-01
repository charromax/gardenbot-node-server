const jwt = require('jsonwebtoken');

module.exports = (context) => {
	const authHeader = context.req.headers.authorization;
	if (authHeader) {
		//Bearer token
		const token = authHeader.split('Bearer ')[1];
		if (token) {
			try {
				const user = jwt.decode(token);
				return user;
			} catch (err) {
				throw new AuthenticationError('Invalid/Expired token');
			}
		}
		throw new Error('No token/unrecognized token');
	}
	throw new Error('Auth header must be provided');
};
