const { getUploadSettingsArgs } = require('./get-upload-settings-args');
const { createAppBundleFromSettings } = require('./create-app-bundle');

const { buildAppUploadSettings } = require('./build-upload-settings');

module.exports = {
  async interactive(options) {
    const settings = await buildAppUploadSettings(options);
    await createAppBundleFromSettings(settings);
  },
  async nonInteractive(options) {
    const settings = await getUploadSettingsArgs(options);
    await createAppBundleFromSettings(settings);
  },
};
