const { activateBundle } = require('./activate-bundle');
const { getActivateSettingsArgs } = require('./get-activate-args');
const { buildBundleActivateSettings } = require('./build-bundle-activate-settings');

module.exports = {
  async interactive(options) {
    const settings = await buildBundleActivateSettings(options);
    activateBundle(settings);
  },
  async nonInteractive(options) {
    const settings = await getActivateSettingsArgs(options);
    activateBundle(settings);
  },
};
