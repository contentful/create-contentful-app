const chalk = require('chalk');
const ora = require('ora');
const { showCreationError } = require('../utils');
const { createClient } = require('contentful-management');

const { createAppUpload } = require('./create-app-upload');

async function createAppBundleFromUpload(settings, appUploadId) {
  const clientSpinner = ora('Verifying your upload...').start();
  const client = createClient({
    accessToken: settings.accessToken,
    application: settings.userAgentApplication
      ? settings.userAgentApplication
      : 'contentful.app-scripts',
  });
  const organization = await client.getOrganization(settings.organization.value);
  const appDefinition = await organization.getAppDefinition(settings.definition.value);
  clientSpinner.stop();

  let appBundle = null;
  const bundleSpinner = ora('Creating the app bundle...').start();
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
    console.log(`
  ${chalk.yellow('Done!')} Your files were successfully uploaded and a new AppUpload (${chalk.dim(
      appUpload.sys.id
    )}) has been created.`);
  } catch (err) {
    showCreationError('app upload', err.message);
  }

  if (!appUpload) return;

  console.log('');
  console.log(`  ----------------------------`);
  const appBundle = await createAppBundleFromUpload(settings, appUpload.sys.id);

  if (!appBundle) return;

  console.log(`
  ${chalk.cyan('Success!')} Created a new app bundle for ${chalk.cyan(
    settings.definition.name
  )} in ${chalk.bold(settings.organization.name)}.

  Bundle Id: ${chalk.yellow(appBundle.sys.id)}
  `);

  if (settings.skipActivation) {
    console.log(`
  ${chalk.green(`NEXT STEPS:`)}

    ${chalk.bold('You can activate this app bundle in your apps settings:')}

      ${chalk.underline('https://app.contentful.com/deeplink?link=app-definition-list')}

    ${chalk.bold('or by simply running the cli command:')}

      ${chalk.underline('npx @contentful/app-scripts activate')}

  `);
  }

  return appBundle;
}

module.exports = {
  createAppBundleFromSettings,
  createAppBundleFromUpload,
};
