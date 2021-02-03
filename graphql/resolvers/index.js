const postsResolvers = require('./posts');
const usersResolvers = require('./users');
const commentsResolvers = require('./comments');
const likesResolvers = require('./likes');
const measuresResolvers = require('./measures');

module.exports = {
    Post: {
        likeCount: (parent) => parent.likes.length,
        commentCount: (parent) => parent.comments.length
    },
    User: {
        deviceCount: (parent) => parent.devices.length
    },
    Query: {
        ...postsResolvers.Query,
        ...measuresResolvers.Query
    },
    Mutation: {
        ...usersResolvers.Mutation,
        ...postsResolvers.Mutation,
        ...commentsResolvers.Mutation,
        ...likesResolvers.Mutation,
        ...measuresResolvers.Mutation
    },

    Subscription: {
        ...postsResolvers.Subscription,
        ...measuresResolvers.Subscription
    }

};