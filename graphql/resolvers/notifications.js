const { withFilter } = require('graphql-subscriptions');
const Device = require('../../models/Device');
const Notification = require('../../models/Notification');

const NEW_NOTIFICATION = 'NEW_NOTIFICATION';

module.exports = {
	Mutation: {
		async addNotification(_, { deviceId, code, message }, context) {
			console.log({ deviceId, code, message });
			const device = await Device.findById(deviceId);
			if (!device) throw new Error('Invalid/Unregistered device');
			const now = new Date();
			const notification = new Notification({
				createdAt: now.toISOString(),
				deviceId: deviceId,
				code: code,
				message: message,
			});
			context.pubsub.publish(NEW_NOTIFICATION, {
				newNotification: notification,
			});
			return notification;
		},
	},
	Subscription: {
		newNotification: {
			subscribe: withFilter(
				(_, __, { pubsub }) => pubsub.asyncIterator(NEW_NOTIFICATION),
				(payload, variables) => {
					return payload.newNotification.deviceId === variables.devId;
				}
			),
		},
	},
};
