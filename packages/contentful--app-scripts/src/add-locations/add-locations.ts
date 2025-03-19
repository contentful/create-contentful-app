import ora from 'ora';
import { cyan, bold, yellow } from 'chalk';
import { throwError } from '../utils';
import { AppLocation, createClient } from 'contentful-management';
import { AddLocationsSettings } from '../types';
import { createTypeSafeLocations } from '../create-type-safe-locations';

export async function add(settings: AddLocationsSettings) {
  const { accessToken, organization, definition, host } = settings;
  const activationSpinner = ora('Adding locations').start();
  const plainClient = createClient({ accessToken, host }, { type: 'plain' });
  const defaultLocations: AppLocation[] = [{ location: 'dialog' }];

  try {
    const currentDefinition = await plainClient.appDefinition.get({
      appDefinitionId: definition.value,
      organizationId: organization.value,
    });

    const typeSafeLocations = createTypeSafeLocations(settings)
    currentDefinition.locations = [
      ...(currentDefinition.locations ?? defaultLocations),
      ...typeSafeLocations,
    ]

    const appBundleId = currentDefinition.bundle?.sys.id
    const currentBundle = appBundleId ? await plainClient.appBundle.get({
      appDefinitionId: definition.value,
      appBundleId,
      organizationId: organization.value,
    }): await Promise.resolve(undefined);
    const hasFrontendFiles = (currentBundle?.files?.length ?? 0) > 0;
    const hasSrc = !!currentDefinition.src
    const useDefaultSrc = !hasFrontendFiles && !hasSrc
    if (useDefaultSrc) {
      currentDefinition.src = 'http://localhost:3000';
    }

    await plainClient.appDefinition.update(
      {
        appDefinitionId: definition.value,
        organizationId: organization.value,
      },
      currentDefinition,
    );

    console.log(`
      ${cyan('Success!')} Your locations were added to ${cyan(definition.name)}
      Locations: ${yellow(typeSafeLocations.map((l) => bold(l.location)).join(', '))}`);
  } catch (err: any) {
    throwError(
      err,
      'Something went wrong addding locations. Make sure you used the correct definition-id.',
    );
  } finally {
    activationSpinner.stop();
  }
}
