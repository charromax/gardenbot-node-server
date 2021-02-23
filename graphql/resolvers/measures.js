const Measure = require('../../models/Measure');
const User = require('../../models/User');
const checkAuth = require('../../util/check-auth');

module.exports = {
	Mutation: {
		async addMeasure(
			_,
			{ airTemp, airHum, soilHum, deviceId, username },
			context
		) {
			const user = await User.findOne({ username });
			console.log(user);
			if (!user) {
				throw new Error('Username is invalid');
			}
			const device = user.devices.find((ownedDev) => ownedDev.id === deviceId);

			if (!device) throw new Error('Invalid/Unregistered device');

			const newMeasure = new Measure({
				createdAt: new Date().toISOString(),
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
			subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_MEASURE'),
		},
	},
};
