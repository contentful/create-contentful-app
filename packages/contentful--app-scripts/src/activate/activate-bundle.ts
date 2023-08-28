import ora from 'ora';
import { cyan, bold, yellow } from 'chalk';
import { throwError } from '../utils';
import { AppLocation, createClient } from 'contentful-management';
import { ActivateSettings } from '../types';

export async function activateBundle({
  accessToken,
  organization,
  definition,
  bundleId,
  host,
}: ActivateSettings) {
  const activationSpinner = ora('Activating your bundle').start();
  const plainClient = createClient({ accessToken, host }, { type: 'plain' });
  const defaultLocations: AppLocation[] = [{ location: 'dialog' }];

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
  if (!currentDefinition.locations?.length) {
    currentDefinition.locations = defaultLocations;
  }
  delete currentDefinition.src;

  try {
    await plainClient.appDefinition.update(
      {
        appDefinitionId: definition.value,
        organizationId: organization.value,
      },
      currentDefinition,
    );
  } catch (err: any) {
    throwError(
      err,
      'Something went wrong activating your bundle. Make sure you used the correct definition-id.',
    );
  } finally {
    activationSpinner.stop();
  }

  console.log(`
  ${cyan('Success!')} Your app bundle was activated for ${cyan(definition.name)} in ${bold(
    organization.name,
  )}.
  Bundle Id: ${yellow(bundleId)}`);
  console.log(`
  ----------------------------
  Ready to share your app with the world? Submit it to the Developer Showcase (${cyan(
    'https://ctfl.io/dev-showcase',
  )}) or our Marketplace (${cyan('https://ctfl.io/submit-app')}).
 `);
}
