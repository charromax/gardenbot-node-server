const Post = require('../../models/Post');
const checkAuth = require('../../util/check-auth');
const { AuthenticationError, UserInputError } = require('apollo-server');

module.exports = {
	Query: {
		async getPosts() {
			try {
				const posts = await Post.find().sort({ createdAt: -1 });
				return posts;
			} catch (err) {
				throw new Error(err);
			}
		},
		async getPost(_, { postId }) {
			try {
				const post = await Post.findById(postId);
				if (post) {
					return post;
				} else {
					throw new Error('Post not found');
				}
			} catch (err) {
				throw new Error(err);
			}
		},
	},
	Mutation: {
		async createPost(_, { body }, context) {
            const user = checkAuth(context);

            if (body.trim() === '') throw new UserInputError('Post cannot be empty!');

			if (user) {
				const newPost = new Post({
					body,
					user: user.id,
					username: user.username,
					createdAt: new Date().toISOString(),
				});

				const post = await newPost.save();
				//Publish to pubsub
				context.pubsub.publish('NEW_POST', {
					newPost: post,
				});

				return post;
			}
		},

		async deletePost(_, { postId }, context) {
			const user = checkAuth(context);

			try {
				const post = await Post.findById(postId);
				if (user.username === post.username) {
					await post.delete();
					return 'Post deleted succesfully';
				} else {
					throw new AuthenticationError('Action not allowed');
				}
			} catch (err) {
				throw new Error(err);
			}
		}	
    },

    Subscription: {
			newPost: {
				subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_POST'),
			},
		},
};
