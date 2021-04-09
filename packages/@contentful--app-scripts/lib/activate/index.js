const { buildBundleActivateSettings } = require('./build-bundle-activate-settings');

module.exports = {
  async interactive() {
    const settings = await buildBundleActivateSettings();
    console.log('ACTIVATE INTERACTIVE', settings);
  },
  async nonInteractive(program, options) {
    console.log('ACTIVATE NON-INTERACTIVE');
  },
};
