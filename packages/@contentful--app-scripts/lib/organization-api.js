const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const { throwError } = require('./utils');

async function fetchOrganizations(client) {
  try {
    const orgs = await client.getOrganizations();

    return orgs.items.map((org) => ({
      name: org.name,
      value: org.sys.id,
    }));
  } catch (err) {
    throwError(
      err,
      'Could not fetch your organizations. Make sure you provided a valid access token.'
    );
  }
}

async function selectOrganization(client) {
  const orgSpinner = ora('Fetching your organizations').start();
  let organizations = null;
  try {
    organizations = await fetchOrganizations(client);
  } finally {
    orgSpinner.stop();
  }

  if (!organizations) {
    return null;
  }
  const { organizationId } = await inquirer.prompt([
    {
      name: 'organizationId',
      message: 'Select an organization for your app:',
      type: 'list',
      choices: organizations,
    },
  ]);
  return organizations.find((org) => org.value === organizationId);
}

async function getOrganizationById(client, orgId) {
  try {
    const org = await client.getOrganization(orgId);
    return {
      name: org.name,
      value: org.sys.id,
    };
  } catch (err) {
    throwError(
      err,
      'Could not fetch your organization. Make sure you provided a valid access token.'
    );
  }
}

module.exports = {
  selectOrganization,
  getOrganizationById,
};
