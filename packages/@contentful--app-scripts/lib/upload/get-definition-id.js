const chalk = require("chalk");
const inquirer = require('inquirer');

async function fetchDefinitions(client, orgId) {
  try {
    const organization = await client.getOrganization(orgId);
    const definitions = await organization.getAppDefinitions()
    return definitions.items.map((def) => ({
      name: def.name,
      value: def.sys.id
    }));
  } catch (err) {
    console.log(`
${chalk.red(
      'Error:'
    )} Could not fetch your app-definitions. Make sure you provided a valid access token.

${err.message}
    `);

    throw err;
  }
}


async function getDefinitionId(client, orgId) {
  const definitions = await fetchDefinitions(client, orgId);

  const { definitionId } = await inquirer.prompt([
    {
      name: 'definitionId',
      message: 'Select an app for your upload:',
      type: 'list',
      choices: definitions
    }
  ]);
  return definitions.find((org) => org.value === definitionId);
}

exports.getDefinitionId = getDefinitionId;
