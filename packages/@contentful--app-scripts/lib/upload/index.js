const chalk = require('chalk');
const { createClient } = require('contentful-management');

const { createAppUpload } = require('./create-app-upload');
const { buildAppUploadSettings } = require('./build-upload-settings');

async function createAppBundle(settings) {
  const client = createClient({ accessToken: settings.mgmToken });
  const org = await client.getOrganization(settings.orgId);
  console.log(org);
}

module.exports = {
  async interactive() {
    console.log(chalk.dim(`Creating an app upload`));
    const settings = await buildAppUploadSettings();

    const appUpload = await createAppUpload(settings);
    const appBundle = await createAppBundle();
    console.log(`${chalk.cyan('Success')} Your files were successfully uploaded`);
  },
  async nonInteractive() {
    console.log('NON-INTERACTIVE UPLOAD');
  },
};
