const { getUploadSettingsArgs } = require('./get-upload-settings-args');
const { createAppBundle } = require('./create-app-bundle');

const { buildAppUploadSettings } = require('./build-upload-settings');

module.exports = {
  async interactive() {
    const settings = await buildAppUploadSettings();
    console.log(settings);
    await createAppBundle(settings);
  },
  async nonInteractive(program, options) {
    const settings = await getUploadSettingsArgs(options);
    await createAppBundle(settings);
  },
};
