const { activateBundle } = require('../activate/activate-bundle');
const { getUploadSettingsArgs } = require('./get-upload-settings-args');
const { createAppBundleFromSettings } = require('./create-app-bundle');

const { buildAppUploadSettings } = require('./build-upload-settings');

async function uploadAndActivate(settings) {
  const bundle = await createAppBundleFromSettings(settings);
  if (!settings.skipActivation && bundle) {
    await activateBundle({ ...settings, bundleId: bundle.sys.id });
  }
}

module.exports = {
  async interactive(options) {
    const settings = await buildAppUploadSettings(options);
    await uploadAndActivate(settings);
  },
  async nonInteractive(options) {
    const settings = await getUploadSettingsArgs(options);
    await uploadAndActivate(settings);
  },
};
