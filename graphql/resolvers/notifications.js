const { MQTTPubSub } = require('graphql-mqtt-subscriptions');
const { withFilter } = require('graphql-subscriptions');
const Device = require('../../models/Device');
const mqtt = require('async-mqtt');
const Notification = require('../../models/Notification');

const client = mqtt.connect('mqtt://maqiatto.com', {
	username: 'manuelrg88@gmail.com',
	password: 'Mg412115',
});
const pubsub = new MQTTPubSub({
	client,
});

const NOTIFICATION_TOPIC = 'manuelrg88@gmail.com/gardenbot/notifications';

module.exports = {
	Mutation: {
		async addNotification(_, { deviceId, code, message }, context) {
			const device = await Device.findById(deviceId);
			if (!device) throw new Error('Invalid/Unregistered device');
			const notification = new Notification(deviceId, code, message);
			context.pubsub.publish('NEW_NOTIFICATION', {
				newNotification: notification,
			});
			return notification;
		},
	},
	Subscription: {
		newNotification: {
			subscribe: withFilter(
				(_, __, ___) => pubsub.asyncIterator(NOTIFICATION_TOPIC),
				(payload, variables) => {
					return payload.newNotification.deviceId === variables.devId;
				}
			),
		},
	},
};
