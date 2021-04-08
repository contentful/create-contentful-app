const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');

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

async function getOrganizationId(client) {
  const orgSpinner = ora('Getting your organizations').start();
  const organizations = await fetchOrganizations(client);
  orgSpinner.stop();
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

exports.getOrganizationId = getOrganizationId;
