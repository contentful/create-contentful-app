const { createAppBundle } = require('./create-app-bundle');

const { buildAppUploadSettings } = require('./build-upload-settings');

module.exports = {
  async interactive() {
    const settings = await buildAppUploadSettings();
    await createAppBundle(settings);
  },
  async nonInteractive() {
    console.log('NON-INTERACTIVE UPLOAD');
  },
};
