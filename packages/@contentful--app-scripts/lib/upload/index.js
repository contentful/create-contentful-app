const chalk = require('chalk');
const ora = require('ora');
const { createClient } = require('contentful-management');

const { createAppUpload } = require('./create-app-upload');
const { buildAppUploadSettings } = require('./build-upload-settings');

async function createAppBundle(settings, appUploadId) {
  const bundleSpinner = ora('Creating the app bundle').start();
  const client = createClient({ accessToken: settings.accessToken });
  const org = await client.getOrganization(settings.organisation.value);
  const appDefinition = await org.getAppDefinition(settings.definition.value);
  // todo ask for comment
  const appBundle = await appDefinition.createAppBundle({ appUploadId });
  bundleSpinner.stop();
  return appBundle;
}

async function uploadFolder(settings) {
  const appUpload = await createAppUpload(settings);
  console.log(
    `${chalk.yellow(
      'Done!'
    )} Your files were successfully uploaded and a new AppUpload (${chalk.dim(
      appUpload.sys.id
    )}) has been created`
  );
  console.log('----------------------------');
  const appBundle = await createAppBundle(settings, appUpload.sys.id);
  console.log(
    `${chalk.cyan('Success!')} Created a new app bundle for ${chalk.cyan(
      settings.definition.name
    )} in ${chalk.bold(settings.organisation.name)}.

  Bundle Id: ${chalk.yellow(appBundle.sys.id)}
  `
  );
  console.log(`
  ${chalk.green(`NEXT STEPS:`)}

    ${chalk.bold('You can activate this app bundle in your apps settings:')}

      ${chalk.underline(`https://app.contentful.com/deeplink?link=app-definition-list`)}

    ${chalk.bold('or by simply running the cli command:')}

      ${chalk.underline(`npx REPLACE WITH COMMAND`)}

  `);
}

module.exports = {
  async interactive() {
    const settings = await buildAppUploadSettings();
    await uploadFolder(settings);
  },
  async nonInteractive() {
    console.log('NON-INTERACTIVE UPLOAD');
  },
};
