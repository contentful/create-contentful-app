const { getCleanUpSettingsArgs } = require('./get-clean-up-settings');
const { buildCleanUpSettings } = require('./build-clean-up-settings');
const { cleanUpBundles } = require('./clean-up-bundles');

module.exports = {
  async interactive(options) {
    const settings = await buildCleanUpSettings(options);
    await cleanUpBundles(settings);
  },
  async nonInteractive(options) {
    const settings = await getCleanUpSettingsArgs(options);
    await cleanUpBundles(settings);
  },
};
