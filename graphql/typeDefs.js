const { gql } = require('apollo-server');

module.exports = gql`
	type Post {
		id: ID!
		body: String!
		createdAt: String!
		username: String!
		comments: [Comment]!
		likes: [Like]!
		likeCount: Int!
		commentCount: Int!
	}

	type Comment {
		id: ID!
		createdAt: String!
		username: String!
		body: String!
	}

	type Like {
		id: ID!
		createdAt: String!
		username: String!
	}

	type User {
		id: ID!
		email: String!
		token: String!
		username: String!
		createdAt: String!
		devices: [Device]!
		deviceCount: Int!
		count: Int!
	}

	type Device {
		id: ID!
		deviceName: String!
		createdAt: String!
		isActivated: Boolean
	}

	type Measure {
		id: ID!
		createdAt: String!
		deviceId: ID!
		airTemp: Float!
		airHum: Float!
		soilHum: Float!
	}

	type Notification {
		id: ID!,
		createdAt: String!
		deviceId: ID!
		code: Int!
		message: String!
	}

	input RegisterInput {
		username: String!
		password: String!
		confirmPassword: String!
		email: String!
	}

	input Order {
		action: Boolean!,
		device_pin: Int!
	}
	
	input Payload {
		deviceId: ID!
		type: String!
		order: Order!
	}

	type Query {
		#FORUM QUERIES
		getPosts: [Post]
		getPost(postId: ID!): Post

		#GARDENBOT QUERIES
		getMeasures(deviceId: ID!): [Measure]!
		refreshToken: String!
		getAllDevices: [Device]!
	}

	type Mutation {
		# FORUM MUTATIONS
		register(registerInput: RegisterInput): User!
		login(username: String!, password: String!): User!
		createPost(body: String!): Post!
		deletePost(postId: ID!): String!
		createComment(postId: ID!, body: String!): Post!
		deleteComment(postId: ID!, commentId: ID!): Post!
		likeDislike(postId: ID!): Post!

		# GARDENBOT MUTATIONS
		registerNewDevice(deviceName: String!): Device!
		activateDevice(deviceName: String!, userId: ID!): Device!
		addMeasure(
			airTemp: Float!
			airHum: Float!
			soilHum: Float!
			deviceId: ID!
		): Measure!
		renameDevice(deviceId:ID!, newName:String!): User!
		sendMqttOrder(payload: Payload): String!
		addNotification(
			deviceId:ID!,
			code: Int!,
			message: String!): String!
	}

	type Subscription {
		newPost: Post!
		newMeasure(devId:ID!): Measure!
		newDevice(devName: String!): Device!
		newNotification(devId: ID!): Notification!
	}

	schema {
		query: Query
		mutation: Mutation
		subscription: Subscription
	}
`;
