/* eslint-disable no-console, no-process-exit */

const chalk = require('chalk');
const inquirer = require('inquirer');
const path = require('path');
const cma = require('contentful-management');
const login = require('./login');

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

module.exports = async function createAppDefition(appDefinitionSettings = {}) {
  try {
    const accessToken = await login();

    const client = cma.createClient({
      accessToken,
    });

    const organizations = await fetchOrganizations(client);

    const { organizationId } = await inquirer.prompt([
      {
        name: 'organizationId',
        message: 'Select an organization for your app:',
        type: 'list',
        choices: organizations,
      },
    ]);
    const selectedOrg = organizations.find((org) => org.value === organizationId);

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
      const createdAppDefition = await organization.createAppDefinition(body);

      console.log(`
  ${chalk.cyan('Success!')} Created an app definition for ${chalk.bold(appName)} in ${chalk.bold(
        selectedOrg.name
      )}.

  ${chalk.dim(`NOTE: You can update this app definition in your organization settings:
        ${chalk.underline(`https://app.contentful.com/deeplink?link=org`)}`)}

  ${chalk.bold('Next steps:')}
    1. To develop, run ${chalk.cyan('`npm start`')} inside your app folder and open:
       ${chalk.underline(
         `https://app.contentful.com/deeplink?link=apps&id=${createdAppDefition.sys.id}`
       )}
    2. To learn how to build your first Contentful app, visit:
       ${chalk.underline(`https://ctfl.io/app-tutorial`)}
      `);
    } catch (err) {
      console.log(`
  Something went wrong while creating the app definition.
  Run ${chalk.cyan('`npx @contentful/create-contentful-app create-definition`')} to try again.

  ${err.message}
      `);

      throw err;
    }
  } catch (e) {
    process.exit(1);
  }
};
