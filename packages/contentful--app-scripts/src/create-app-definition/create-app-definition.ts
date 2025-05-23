import path from 'node:path';

import { ClientAPI, createClient } from 'contentful-management';
import chalk from 'chalk';
import { isString, isPlainObject, has } from 'lodash';

import { throwValidationException, selectFromList, getWebAppHostname } from '../utils';
import { cacheEnvVars } from '../cache-credential';
import { ORG_ID_ENV_KEY, APP_DEF_ENV_KEY } from '../constants';
import { AppDefinitionSettings } from '../types';
import { createTypeSafeLocations } from '../create-type-safe-locations';

async function fetchOrganizations(client: ClientAPI) {
  try {
    const orgs = await client.getOrganizations();

    return orgs.items.map((org) => ({
      name: org.name,
      value: org.sys.id,
    }));
  } catch (err: any) {
    console.log(`
${chalk.red(
  'Error:'
)} Could not fetch your organizations. Make sure you provided a valid access token.

${err.message}
    `);

    throw err;
  }
}

function assertValidArguments(accessToken: string, appDefinitionSettings: AppDefinitionSettings) {
  if (!isString(accessToken)) {
    throwValidationException('AccessToken', `Expected string got ${typeof accessToken}`);
  }

  if (!isPlainObject(appDefinitionSettings) || !has(appDefinitionSettings, 'locations')) {
    throwValidationException(
      'AppDefinitionSettings',
      `Expected plain object with 'locations' property, got ${JSON.stringify(
        appDefinitionSettings,
        null,
        2
      )}`,
      `Example: ${JSON.stringify(
        {
          name: 'app-name',
          locations: ['entry-field'],
          fields: [{ type: 'Boolean' }],
        },
        null,
        2
      )}`
    );
  }
}

export async function createAppDefinition(
  accessToken: string,
  appDefinitionSettings: AppDefinitionSettings
) {
  assertValidArguments(accessToken, appDefinitionSettings);

  const host = appDefinitionSettings.host;
  const client = createClient({ accessToken, host });
  const organizations = await fetchOrganizations(client);

  const selectedOrg = await selectFromList(
    organizations,
    'Select an organization for your app:',
    ORG_ID_ENV_KEY
  );
  const organizationId = selectedOrg.value;

  const appName = appDefinitionSettings.name || path.basename(process.cwd());
  const locations = createTypeSafeLocations(appDefinitionSettings)
  const hasFrontendLocation = locations.some(({ location }) => location !== 'dialog');
  const body = {
    name: appName,
    src: hasFrontendLocation ? 'http://localhost:3000' : undefined,
    locations,
    parameters: {
      ...(appDefinitionSettings.parameters?.instance && {
        instance: appDefinitionSettings.parameters.instance,
      }),
      ...(appDefinitionSettings.parameters?.installation && {
        installation: appDefinitionSettings.parameters.installation,
      }),
    },
  };

  try {
    const organization = await client.getOrganization(organizationId);
    const createdAppDefinition = await organization.createAppDefinition(body);
    await cacheEnvVars({
      [APP_DEF_ENV_KEY]: createdAppDefinition.sys.id,
    });

    const webApp = getWebAppHostname(host);

    console.log(`
  ${chalk.greenBright('Success!')} Created an app definition for ${chalk.bold(
      appName
    )} in ${chalk.bold(selectedOrg.name)}.

  ${chalk.dim(`NOTE: You can update this app definition in your apps settings:
        ${chalk.underline(`https://${webApp}/deeplink?link=app-definition-list`)}`)}

  ${chalk.bold('Next steps:')}
    1. Run your app with ${chalk.cyan('`npm start`')} inside of your app folder.
    2. Install this app definition to one of your spaces by opening:
        ${chalk.underline(`https://${webApp}/deeplink?link=apps&id=${createdAppDefinition.sys.id}`)}
    3. Learn how to build your first Contentful app:
        ${chalk.underline(`https://ctfl.io/app-tutorial`)}
      `);
  } catch (err: any) {
    console.log(`
  Something went wrong while creating the app definition.
  Run ${chalk.cyan('`npx @contentful/app-scripts create-app-definition`')} to try again.

  ${err.message}
    `);

    throw err;
  }
}
