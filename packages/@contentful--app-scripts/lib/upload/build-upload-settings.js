// @ts-check

const inquirer = require('inquirer');
const { getDefinitionById } = require('../definition-api');
const { getOrganizationById } = require('../organization-api');
const { selectDefinition } = require('../definition-api');
const { selectOrganization } = require('../organization-api');

const { createClient } = require('contentful-management');
const { getManagementToken } = require('../get-management-token');

async function buildAppUploadSettings(options) {
  const prompts = [];
  if (!options.bundleDir) {
    prompts.push({
      name: 'bundleDirectory',
      message: `Bundle directory, if not current:`,
      default: '.',
    });
  }
  if (!options.comment) {
    prompts.push({
      name: 'comment',
      message: `Add a comment to the created bundle:`,
      default: '',
    });
  }

  const appUploadSettings = await inquirer.prompt(prompts);

  const accessToken = options.token || (await getManagementToken());

  const client = createClient({ accessToken });

  const selectedOrg = options.organizationId
    ? await getOrganizationById(client, options.organizationId)
    : await selectOrganization(client);

  const selectedDefinition = options.definitionId
    ? await getDefinitionById(client, selectedOrg.value, options.definitionId)
    : await selectDefinition(client, selectedOrg.value);

  // Add app-config & dialog automatically
  return {
    ...appUploadSettings,
    organization: selectedOrg,
    definition: selectedDefinition,
    accessToken,
  };
}

module.exports = {
  buildAppUploadSettings,
};
