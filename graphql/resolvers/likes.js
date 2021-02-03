const Post = require('../../models/Post');
const checkAuth = require('../../util/check-auth');
const { UserInputError, AuthenticationError } = require('apollo-server');

module.exports = {
	Mutation: {
		async likeDislike(_, { postId }, context) {
			const { username } = checkAuth(context);
			const post = await Post.findById(postId);

			try {
				if (post) {
					if (post.likes.find((like) => like.username === username)) {
						//Post already liked
						post.likes = post.likes.filter(
							(like) => like.username !== username
						);
					} else {
						//Post not liked yet
						post.likes.push({
							username: username,
							createdAt: new Date().toISOString(),
						});
					}
					await post.save();

					return post;
				} else {
					throw new UserInputError("Post doesn't exist!");
				}
			} catch (err) {
				throw new Error(err);
			}
		},
	},
};
