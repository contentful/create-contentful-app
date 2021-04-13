const chalk = require('chalk');
const ora = require('ora');
const { showCreationError } = require('../utils');
const { createClient } = require('contentful-management');

const { createAppUpload } = require('./create-app-upload');

async function createAppBundleFromUpload(settings, appUploadId) {
  console.log(settings.definition);
  const clientSpinner = ora('Verifing your upload').start();
  const client = createClient({ accessToken: settings.accessToken });
  const organization = await client.getOrganization(settings.organisation.value);
  const appDefinition = await organization.getAppDefinition(settings.definition.value);
  clientSpinner.stop();

  let appBundle = null;
  const bundleSpinner = ora('Creating the app bundle').start();
  try {
    appBundle = await appDefinition.createAppBundle({
      appUploadId,
      comment: settings.comment && settings.comment.length > 0 ? settings.comment : undefined,
    });
  } catch (err) {
    showCreationError('app upload', err.message);
  }
  bundleSpinner.stop();
  return appBundle;
}

async function createAppBundleFromSettings(settings) {
  let appUpload = null;
  try {
    appUpload = await createAppUpload(settings);
    console.log('UPLOAD', appUpload);
    console.log(
      `${chalk.yellow(
        'Done!'
      )} Your files were successfully uploaded and a new AppUpload (${chalk.dim(
        appUpload.sys.id
      )}) has been created`
    );
  } catch (err) {
    showCreationError('app upload', err.message);
  }

  if (!appUpload) return;

  console.log('----------------------------');
  const appBundle = await createAppBundleFromUpload(settings, appUpload.sys.id);

  if (!appBundle) return;

  console.log(`
  ${chalk.cyan('Success!')} Created a new app bundle for ${chalk.cyan(
    settings.definition.name
  )} in ${chalk.bold(settings.organisation.name)}.

  Bundle Id: ${chalk.yellow(appBundle.sys.id)}
  `);
  console.log(`
  ${chalk.green(`NEXT STEPS:`)}

    ${chalk.bold('You can activate this app bundle in your apps settings:')}

      ${chalk.underline(`https://app.contentful.com/deeplink?link=app-definition-list`)}

    ${chalk.bold('or by simply running the cli command:')}

      ${chalk.underline(`contentful-app-scripts activate`)}

  `);
}

module.exports = {
  createAppBundleFromSettings,
  createAppBundleFromUpload,
};
