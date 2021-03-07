const { withFilter } = require('graphql-subscriptions');
const Device = require('../../models/Device');
const Measure = require('../../models/Measure');
const User = require('../../models/User');
const checkAuth = require('../../util/check-auth');
const devices = require('./devices');

module.exports = {
	Mutation: {
		async addMeasure(
			_,
			{ airTemp, airHum, soilHum, deviceId }, context
		) {

			const device = await Device.findById(deviceId)

			if (!device) throw new Error('Invalid/Unregistered device');

			const newMeasure = new Measure({
				deviceId: deviceId,
				airTemp: airTemp,
				airHum: airHum,
				soilHum: soilHum,
			});

			const measure = await newMeasure.save();
			context.pubsub.publish('NEW_MEASURE', {
				newMeasure: measure,
			});
			return measure;
		},
	},
	Query: {
		/**
		 * returns all available environment data for specified device
		 *
		 * @param {*} _
		 * @param {String} deviceId
		 */
		async getMeasures(_, { deviceId }, context) {
			const user = checkAuth(context);

			if (user) {
				try {
					const allMeasures = await Measure.find({ deviceId: deviceId }).sort({
						createdAt: -1,
					});

					console.log(allMeasures);
					return allMeasures;
				} catch (err) {
					throw new Error(err);
				}
			}
		},
	},
	Subscription: {
		newMeasure: {
			subscribe: withFilter(
				(_, __, { pubsub }) => pubsub.asyncIterator('NEW_MEASURE'),
				(payload, variables) => {
					return (payload.newMeasure.deviceId === variables.devId)
				}
			)
		},
	},
};
