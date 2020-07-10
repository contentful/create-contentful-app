/* eslint-disable no-console, no-process-exit */

const inquirer = require('inquirer');
const path = require('path');
const { createClient } = require('contentful-management');
const login = require('./login');

async function fetchOrganizations(client) {
  try {
    const orgs = await client.getOrganizations();

    return orgs.items.map(org => ({
      name: `${org.name} (${org.sys.id})`,
      value: org.sys.id
    }));
  } catch (err) {
    console.log();
    console.log('Could not fetch your organizations. Make sure you provided a valid access token.');
    console.log();
    console.log(err.message);
    process.exit(1);
  }
}

module.exports = async function createAppDefition(appDefinitionSettings = {}) {
  let selectedOrg;

  const accessToken = await login();

  const client = createClient({
    accessToken
  });

  const organizations = await fetchOrganizations(client);

  const { organizationId } = await inquirer.prompt([
    {
      name: 'organizationId',
      message: 'Select an organization for your app:',
      type: 'list',
      choices: organizations
    }
  ]);
  selectedOrg = organizations.find(org => org.value === organizationId);

  const appName = appDefinitionSettings.name || path.basename(process.cwd());
  const body = {
    name: appName,
    src: 'http://localhost:3000',
    locations: appDefinitionSettings.locations.map(location => {
      if (location === 'entry-field') {
        return {
          location,
          fieldTypes: appDefinitionSettings.fields.map(field => ({
            type: field
          }))
        };
      }

      return {
        location
      };
    })
  };

  try {
    const organization = await client.getOrganization(organizationId);
    const createdAppDefition = await organization.createAppDefinition(body);

    console.log();
    console.log(`App ${appName} has been successfully created in ${selectedOrg.name}`);
    console.log();
    console.log();
    console.log('\033[1mNext steps:\033[0m ');
    console.log(
      `   1. To develop, run \`npm start\` inside your app folder and open https://app.contentful.com/deeplink?link=apps&id=${createdAppDefition.sys.id}`
    );
    console.log(
      `   2. To learn how to build your first Contentful app, visit https://ctfl.io/app-tutorial`
    );
    console.log();
  } catch (err) {
    console.log();
    console.log(
      'Something went wrong with creating app definition. Run `create-contentful-app create-definition` to try again.'
    );
    console.log();
    console.log(err.message);
    process.exit(1);
  }
};
