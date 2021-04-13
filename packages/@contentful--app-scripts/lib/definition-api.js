const ora = require('ora');
const { selectFromList } = require('./utils');
const { throwError } = require('./utils');

async function fetchDefinitions(client, orgId) {
  try {
    const organization = await client.getOrganization(orgId);
    const definitions = await organization.getAppDefinitions();
    return definitions.items.map((def) => ({
      name: def.name,
      value: def.sys.id,
    }));
  } catch (err) {
    throwError(
      'Could not fetch your app-definitions. Make sure you provided a valid access token.',
      err
    );
  }
}

async function selectDefinition(client, orgId) {
  const defSpinner = ora('Fetching all definitions...').start();
  const definitions = await fetchDefinitions(client, orgId);
  defSpinner.stop();

  return await selectFromList(definitions, 'Select an app for your upload:');
}

async function getDefinitionById(client, orgId, defId) {
  try {
    const organization = await client.getOrganization(orgId);
    const definition = await organization.getAppDefinition(defId);
    return {
      name: definition.name,
      value: definition.sys.id,
    };
  } catch (err) {
    throwError(
      'Could not fetch your app-definition. Make sure you provided a valid definition id or access token.',
      err
    );
    throw err;
  }
}

module.exports = {
  selectDefinition,
  getDefinitionById,
};
