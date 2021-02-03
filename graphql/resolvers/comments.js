const Post = require('../../models/Post');
const checkAuth= require('../../util/check-auth');
const { UserInputError, AuthenticationError }= require('apollo-server');


module.exports = {
    Mutation: {
        async createComment(_, { postId, body }, context) {
            const user = checkAuth(context);

            if (body.trim()=== '') {
                throw new UserInputError('Empty comment', {
                    errors: {
                        body: 'Comment body must not be empty'
                    }
                })
            }

            const post = await Post.findById(postId);
            if (post) {
                post.comments.unshift({
                    body: body,
                    username: user.username,
                    createdAt: new Date().toISOString()
                })
                await post.save();
                return post;
            } else {
                throw new UserInputError('Post doesn\'t exist!')
            }
        },

        async deleteComment(_, { postId, commentId }, context) {
            const { username } = checkAuth(context);
            const post = await Post.findById(postId);
            try {

                if(post){
                    const commentIndex = post.comments.findIndex(savedComment => savedComment.id === commentId);
                    if (username === post.comments[commentIndex].username) {
                        post.comments.splice(commentIndex, 1);
                        await post.save();
                        return post;
                    } else {
                        throw new AuthenticationError('You can only delete your own posts!');
                    }
                } else {
                    throw new UserInputError('Post doesn\'t exist!')
                }
                
            } catch (err) {
                throw new Error('Unknown error ocurred');
            }
        }
    }
}