// @ts-check

const inquirer = require('inquirer');
const { selectDefinition } = require('./definition-api');
const { selectOrganization } = require('./organization-api');

const { createClient } = require('contentful-management');
const { getManagementToken } = require('../get-management-token');

async function buildAppUploadSettings() {
  const appUploadSettings = await inquirer.prompt([
    {
      name: 'bundle-directory',
      message: `Bundle directory, if not current:`,
      default: '.',
    },
    {
      name: 'comment',
      message: `Add a comment to the created bundle:`,
      default: '',
    },
  ]);

  const accessToken = await getManagementToken();

  const client = createClient({ accessToken });

  const selectedOrg = await selectOrganization(client);

  const selectedDefinition = await selectDefinition(client, selectedOrg.value);

  // Add app-config & dialog automatically
  return {
    ...appUploadSettings,
    organisation: selectedOrg,
    definition: selectedDefinition,
    accessToken,
  };
}

exports.buildAppUploadSettings = buildAppUploadSettings;
