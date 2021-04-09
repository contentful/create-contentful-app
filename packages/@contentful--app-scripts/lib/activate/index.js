const { activateBundle } = require('./activate-bundle');
const { getActivateSettingsArgs } = require('./get-activate-args');
const { buildBundleActivateSettings } = require('./build-bundle-activate-settings');

module.exports = {
  async interactive() {
    const settings = await buildBundleActivateSettings();
    activateBundle(settings);
  },
  async nonInteractive(program, options) {
    const settings = await getActivateSettingsArgs(options);
    activateBundle(settings);
  },
};
