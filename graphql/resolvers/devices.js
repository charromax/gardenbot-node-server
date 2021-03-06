const checkAuth = require('../../util/check-auth');
const Device = require('../../models/Device');
const User = require('../../models/User');

module.exports = {
	Mutation: {
		/**
		 * Registers new device
		 *
		 * @param {String} deviceName
		 * @throws {UserInputError}
		 */
		async registerNewDevice(_, { deviceName }) {
			if (deviceName.trim() === '') {
				throw new UserInputError('Empty device name', {
					errors: {
						body: 'Device name must not be empty',
					},
				});
			}
			const device = new Device({
				deviceName: deviceName,
				createdAt: new Date().toISOString(),
			});

			const newDevice = await device.save();
			return newDevice;
		},

		/**
		 * Activates a newly registered device
		 *
		 * @param {String} deviceName: device S/N as printed in box
		 * @param {String} userId: valid registered user id
		 * @param {Context} context: requires Token
		 */
		async activateDevice(_, { deviceName, userId }, context) {
			//TODO: mark activated devices so as not to allow duplication
			if (deviceName.trim() === '') {
				throw new UserInputError('Empty device name', {
					errors: {
						body: 'Device name must not be empty',
					},
				});
			}
			const validateUser = checkAuth(context);
			const device = await Device.findOne({ deviceName });
			console.log(device);
			if (device && validateUser) {
				const user = await User.findById(userId);
				console.log(user);
				if (user) {
					console.log('adding to list ' + device);
					user.devices.unshift(device.id);
				}
				const res = await user.save();
				return device;
			} else {
				throw new Error('Invalid device name or user');
			}
		},
	},
	Subscription: {
		newDevice: {
			subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_DEVICE'),
		},
	},
};
