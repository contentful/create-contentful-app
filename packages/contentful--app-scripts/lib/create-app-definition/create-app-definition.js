const path = require('path');

const { createClient } = require('contentful-management');
const chalk = require('chalk');
const { isString, isPlainObject, has } = require('lodash');

const { throwValidationException, selectFromList } = require('../utils');
const { cacheEnvVars } = require('../../utils/cache-credential');
const { ORG_ID_ENV_KEY, APP_DEF_ENV_KEY } = require('../../utils/constants');

async function fetchOrganizations(client) {
  try {
    const orgs = await client.getOrganizations();

    return orgs.items.map((org) => ({
      name: org.name,
      value: org.sys.id,
    }));
  } catch (err) {
    console.log(`
${chalk.red(
  'Error:'
)} Could not fetch your organizations. Make sure you provided a valid access token.

${err.message}
    `);

    throw err;
  }
}

function assertValidArguments(accessToken, appDefinitionSettings) {
  if (!isString(accessToken)) {
    throwValidationException('AccessToken', `Expected string got ${typeof accessToken}`);
  }

  if (!isPlainObject(appDefinitionSettings) || !has(appDefinitionSettings, 'locations')) {
    throwValidationException(
      'AppDefinitionSettings',
      `Expected plain object with 'location' property, got ${JSON.stringify(
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

async function createAppDefinition(accessToken, appDefinitionSettings = { locations: [] }) {
  assertValidArguments(accessToken, appDefinitionSettings);

  const client = createClient({ accessToken });
  const organizations = await fetchOrganizations(client);

  const selectedOrg = await selectFromList(
    organizations,
    'Select an organization for your app:',
    ORG_ID_ENV_KEY
  );
  const organizationId = selectedOrg.value;

  const appName = appDefinitionSettings.name || path.basename(process.cwd());
  const body = {
    name: appName,
    src: 'http://localhost:3000',
    locations: appDefinitionSettings.locations.map((location) => {
      if (location === 'entry-field') {
        return {
          location,
          fieldTypes: appDefinitionSettings.fields,
        };
      }

      return {
        location,
      };
    }),
  };

  try {
    const organization = await client.getOrganization(organizationId);
    const createdAppDefinition = await organization.createAppDefinition(body);
    await cacheEnvVars({
      [APP_DEF_ENV_KEY]: createdAppDefinition.sys.id,
    });

    console.log(`
  ${chalk.greenBright('Success!')} Created an app definition for ${chalk.bold(appName)} in ${chalk.bold(
      selectedOrg.name
    )}.

  ${chalk.dim(`NOTE: You can update this app definition in your organization settings:
        ${chalk.underline(`https://app.contentful.com/deeplink?link=org`)}`)}

  ${chalk.bold('Next steps:')}
    1. Run your app with ${chalk.cyan('`npm start`')} inside of your app folder.
    2. Install this app definition to one of your spaces by opening:
        ${chalk.underline(
          `https://app.contentful.com/deeplink?link=apps&id=${createdAppDefinition.sys.id}`
        )}
    3. Learn how to build your first Contentful app:
        ${chalk.underline(`https://ctfl.io/app-tutorial`)}
      `);
  } catch (err) {
    console.log(`
  Something went wrong while creating the app definition.
  Run ${chalk.cyan('`npx @contentful/app-scripts create-app-definition`')} to try again.

  ${err.message}
    `);

    throw err;
  }
}

module.exports = {
  createAppDefinition,
};
