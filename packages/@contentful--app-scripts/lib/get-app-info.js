// get organisation-id, app-definition-id and access token from options or ask for it
const { getDefinitionById, selectDefinition } = require('./definition-api');
const { selectOrganization, getOrganizationById } = require('./organization-api');
const { createClient } = require('contentful-management');
const { getManagementToken } = require('./get-management-token');

const getAppInfo = async (options) => {
  const accessToken = options.token || (await getManagementToken());

  const client = createClient({ accessToken });

  const organisation = options.organizationId
    ? await getOrganizationById(client, options.organizationId)
    : await selectOrganization(client);

  const definition = options.definitionId
    ? await getDefinitionById(client, organisation.value, options.definitionId)
    : await selectDefinition(client, organisation.value);

  return {
    accessToken,
    organisation,
    definition,
  };
};

exports.getAppInfo = getAppInfo;
