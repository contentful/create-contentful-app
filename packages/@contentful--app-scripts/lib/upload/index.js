const { getUploadSettingsArgs } = require('./get-upload-settings-args');
const { createAppBundle } = require('./create-app-bundle');

const { buildAppUploadSettings } = require('./build-upload-settings');

module.exports = {
  async interactive(options) {
    const settings = await buildAppUploadSettings(options);
    await createAppBundle(settings);
  },
  async nonInteractive(options) {
    const settings = await getUploadSettingsArgs(options);
    await createAppBundle(settings);
  },
};
