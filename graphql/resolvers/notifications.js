const { MQTTPubSub } = require('graphql-mqtt-subscriptions');
const { withFilter } = require('apollo-server');
import { connect } from 'mqtt';


const client = connect('mqtt://maqiatto.com', {
	username: 'manuelrg88@gmail.com',
	password: 'Mg412115',
	reconnectPeriod: 1000,
});
const pubsub = new MQTTPubSub({
	client,
});

const NOTIFICATION_TOPIC = 'manuelrg88@gmail.com/gardenbot/notifications';

export const resolvers = {
	Subscription: {
		newNotification: {
			subscribe: withFilter((_, __) => pubsub.asyncIterator(NOTIFICATION_TOPIC),
            (payload, variables) => {
				console.log("notification received");
                return payload.newNotification.deviceId === variables.devId;
            }),
		},
	},
};
