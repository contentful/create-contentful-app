// @ts-check

const inquirer = require('inquirer');
const { getDefinitionId } = require('./get-definition-id');
const ora = require('ora');
const { createClient } = require('contentful-management');
const { getManagementToken } = require('../get-management-token');
const { getOrganizationId } = require('../get-organization-id');

async function buildAppUploadSettings() {
  const appUploadSettings = await inquirer.prompt([
    {
      name: 'bundle-directory',
      message: `Bundle directory, if not current:`,
      default: '.',
    },
  ]);
  const accessToken = await getManagementToken();

  const client = createClient({ accessToken });

  const selectedOrg = await getOrganizationId(client);

  const selectedDefinition = await getDefinitionId(client, selectedOrg.value);

  // Add app-config & dialog automatically
  return { ...appUploadSettings, orgId: selectedOrg.value, defId: selectedDefinition.value };
}

exports.buildAppUploadSettings = buildAppUploadSettings;
