const { ApolloServer, PubSub } = require('apollo-server');
const mongoose = require('mongoose');

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { MONGODB } = require('./config.js');

const pubsub = new PubSub();

const PORT = process.env.PORT || 5000;

const server = new ApolloServer({
	typeDefs,
	resolvers,
	introspection: true,
	playground: true,
	context: ({ req }) => ({ req, pubsub }), //take request and response from express and pass it along
});

mongoose
	.connect(MONGODB, { useNewUrlParser: true })
	.then(() => {
		console.log('MongoDB connected');
		return server.listen({ port: PORT });
	})
	.then((res) => {
		console.log(`Server running at ${res.url}`);
	})
	.catch((err) => {
		console.log(err);
	});
