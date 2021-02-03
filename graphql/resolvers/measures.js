const Measure = require('../../models/Measure');
const User = require('../../models/User');

module.exports = {
	Mutation: {
		async addMeasure(
			_,
			{ dataInput: { airTemp, airHum, soilHum, deviceId, username } }
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
				deviceId,
				airTemp,
				airHum,
				soilHum,
			});

			const measure = await newMeasure.save();
			//TODO: PUB SUB
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
		async getMeasures(_, { deviceId }) {
			try {
				const allMeasures = await Measure.find({ deviceId: deviceId }).sort({
					createdAt: -1,
				});

				console.log(allMeasures);

				return allMeasures;
			} catch (err) {
				throw new Error(err);
			}
		},
	},
	Mutation: {
		async addMeasure(
			_,
			{
				doc: {
					data: { device_id, rel_humidity, temperature, soil_humidity },
				},
			},
			context
		) {
			try {
				const newMeasure = Measure({
					createdAt: new Date().toISOString(),
					deviceId: device_id,
					airTemp: temperature,
					airHum: rel_humidity,
					soilHum: soil_humidity,
				});
				const measure = await newMeasure.save();

				context.pubsub.publish('NEW_MEASURE', {
					newMeasure: measure,
				});

			} catch (err) {
				throw new Error(err);
			}
		},
	},
	Subscription: {
		newMeasure: {
			subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_MEASURE'),
		},
	},
};
