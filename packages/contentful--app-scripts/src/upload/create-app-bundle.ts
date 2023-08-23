import chalk from 'chalk';
import ora from 'ora';
import { showCreationError } from '../utils';
import { createClient } from 'contentful-management';

import { createAppUpload } from './create-app-upload';
import { UploadSettings } from '../types';

export async function createAppBundleFromUpload(settings: UploadSettings, appUploadId: string) {
  const { accessToken, host, userAgentApplication, comment, actions } = settings;
  const clientSpinner = ora('Verifying your upload...').start();
  const client = createClient({
    accessToken,
    host,
    application: userAgentApplication ? userAgentApplication : 'contentful.app-scripts',
  });
  const organization = await client.getOrganization(settings.organization.value);
  const appDefinition = await organization.getAppDefinition(settings.definition.value);
  clientSpinner.stop();

  let appBundle = null;
  const bundleSpinner = ora('Creating the app bundle...').start();
  try {
    appBundle = await appDefinition.createAppBundle({
      appUploadId,
      comment: comment && comment.length > 0 ? comment : undefined,
      actions,
    });
  } catch (err: any) {
    showCreationError('app upload', err.message);
  }
  bundleSpinner.stop();
  return appBundle;
}

export async function createAppBundleFromSettings(settings: UploadSettings) {
  let appUpload = null;
  try {
    appUpload = await createAppUpload(settings);

    if (!appUpload) return;

    console.log(`
  ${chalk.yellow('Done!')} Your files were successfully uploaded and a new AppUpload (${chalk.dim(
      appUpload.sys.id
    )}) has been created.`);
  } catch (err: any) {
    return showCreationError('app upload', err.message);
  }

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
