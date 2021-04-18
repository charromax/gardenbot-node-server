const checkAuth = require('../../util/check-auth');
const Device = require('../../models/Device');
const User = require('../../models/User');
const { withFilter } = require('apollo-server');

module.exports = {
	Query: {
		async getAllDevices(_, __, context) {
			try {
				const { userId } = checkAuth(context);
				if (!userId) {
					throw new Error('Invalid/Unregistered user id');
				} else {
					const user = await User.findById(userId);
					return user.devices;
				}
			} catch (error) {
				throw new Error(error);
			}
		},
	},
	Mutation: {
		/**
		 * Registers new device
		 *
		 * @param {String} deviceName
		 * @throws {UserInputError}
		 */
		async registerNewDevice(_, { deviceName }, context) {
			if (deviceName.trim() === '') {
				throw new UserInputError('Empty device name', {
					errors: {
						body: 'Device name must not be empty',
					},
				});
			}
			const device = new Device({
				deviceName: deviceName,
			});

			const saveDevice = await device.save();
			context.pubsub.publish('NEW_DEVICE', {
				newDevice: saveDevice,
			});
			return saveDevice;
		},

		/**
		 *  Rename devices in users list for easier identification
		 *
		 * @param {String} deviceId: db-issued ID for the device we want to update
		 * @param {String} newName: new name for the device
		 * @param {Context} context: token required
		 * @returns User
		 */
		async renameDevice(_, { deviceId, newName }, context) {
			try {
				if (deviceId.trim() === '' || newName.trim() === '') {
					throw new UserInputError('Empty device name or id', {
						errors: {
							body: 'Device name and id must not be empty',
						},
					});
				} else {
					const { id } = checkAuth(context);
					if (!id) {
						throw new Error('Invalid/Unregistered user');
					} else {
						const savedDevice = await Device.findById(deviceId);
						savedDevice.deviceName = newName;
						const updateDevice = await savedDevice.save();
						const savedUser = await User.findById(id);
						const index = savedUser.devices.findIndex(
							(dev) => dev._id === deviceId
						);
						savedUser.devices.splice(index, 1);
						savedUser.devices.push(updateDevice);
						const updatedUser = await savedUser.save();
						return updatedUser;
					}
				}
			} catch (error) {
				throw new Error(error);
			}
		},

		/**
		 * Activates a newly registered device
		 *
		 * @param {String} deviceName: device S/N as printed in box(now using MAC address)
		 * @param {String} userId: valid registered user id
		 * @param {Context} context: requires Token
		 */
		async activateDevice(_, { deviceName, userId }, context) {
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
				device.isActivated = true;
				const activeDevice = await device.save();
				const user = await User.findByIdAndUpdate(userId, {
					$push: { devices: device },
				});
				const res = await user.save();
				return device;
			} else {
				throw new Error('Invalid device name or user');
			}
		},
	},
	Subscription: {
		newDevice: {
			subscribe: withFilter(
				(_, __, { pubsub }) => pubsub.asyncIterator('NEW_DEVICE'),
				(payload, variables) => {
					return payload.newDevice.deviceName === variables.devName;
				}
			),
		},
	},
};
