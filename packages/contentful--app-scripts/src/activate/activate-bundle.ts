import ora from 'ora';
import { cyan, bold, yellow } from 'chalk';
import { throwError } from '../utils';
import { AppBundleProps, AppLocation, createClient } from 'contentful-management';
import { ActivateSettings } from '../types';

export async function activateBundle({
  accessToken,
  organization,
  definition,
  bundleId,
  host,
  hasFrontend,
}: ActivateSettings) {
  const activationSpinner = ora('Activating your bundle').start();
  const plainClient = createClient({ accessToken, host }, { type: 'plain' });
  const defaultLocations: AppLocation[] = [{ location: 'dialog' }];
  let doesBundleHaveFrontend = hasFrontend;

  const currentDefinition = await plainClient.appDefinition.get({
    appDefinitionId: definition.value,
    organizationId: organization.value,
  });

  currentDefinition.bundle = {
    sys: {
      id: bundleId,
      linkType: 'AppBundle',
      type: 'Link',
    },
  };

  // if `hasFrontend` is not passed in, fetch the bundle to determine if it has a frontend
  let bundle: AppBundleProps;
  if (doesBundleHaveFrontend === undefined) {
    bundle = await plainClient.appBundle.get({
      appBundleId: bundleId,
      appDefinitionId: definition.value,
      organizationId: organization.value,
    });

    if (bundle.files.length) {
      doesBundleHaveFrontend = true;
    } else {
      doesBundleHaveFrontend = false;
    }
  }

  // if the bundle has frontend code in the bundle, remove the src from the definition since the frontend will now be hosted by Contentful
  if (doesBundleHaveFrontend) {
    delete currentDefinition.src;
  }
  
  // if the bundle has frontend code and there are no locations already on the app definition set the default location to dialog
  if (doesBundleHaveFrontend && !currentDefinition.locations?.length) {
    currentDefinition.locations = defaultLocations;
  }

  try {
    await plainClient.appDefinition.update(
      {
        appDefinitionId: definition.value,
        organizationId: organization.value,
      },
      currentDefinition
    );
  } catch (err: any) {
    throwError(
      err,
      'Something went wrong activating your bundle. Make sure you used the correct definition-id.'
    );
  } finally {
    activationSpinner.stop();
  }

  console.log(`
  ${cyan('Success!')} Your app bundle was activated for ${cyan(definition.name)} in ${bold(
    organization.name
  )}.
  Bundle Id: ${yellow(bundleId)}`);
  console.log(`
  ----------------------------
  Ready to share your app with the world? Submit it to the Developer Showcase (${cyan(
    'https://ctfl.io/dev-showcase'
  )}) or our Marketplace (${cyan('https://ctfl.io/submit-app')}).
 `);
}
