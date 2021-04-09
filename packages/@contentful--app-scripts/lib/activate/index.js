const { getActivateSettingsArgs } = require('./get-activate-args');
const { buildBundleActivateSettings } = require('./build-bundle-activate-settings');

module.exports = {
  async interactive() {
    const settings = await buildBundleActivateSettings();
    console.log('ACTIVATE INTERACTIVE', settings);
  },
  async nonInteractive(program, options) {
    const settings = await getActivateSettingsArgs(options);
    console.log('ACTIVATE NON-INTERACTIVE', settings);
  },
};
