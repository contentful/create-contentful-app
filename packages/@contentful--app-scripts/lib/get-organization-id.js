const inquirer = require('inquirer');
const chalk = require('chalk');

async function fetchOrganizations(client) {
  try {
    const orgs = await client.getOrganizations();

    return orgs.items.map((org) => ({
      name: org.name,
      value: org.sys.id
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

async function getOrganizationId(client) {
  const organizations = await fetchOrganizations(client);

  const { organizationId } = await inquirer.prompt([
    {
      name: 'organizationId',
      message: 'Select an organization for your app:',
      type: 'list',
      choices: organizations
    }
  ]);
  return organizations.find((org) => org.value === organizationId);
}

exports.getOrganizationId = getOrganizationId;
