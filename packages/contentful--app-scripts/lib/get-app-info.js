const { getDefinitionById, selectDefinition } = require('./definition-api');
const { selectOrganization, getOrganizationById } = require('./organization-api');
const { createClient } = require('contentful-management');
const { getManagementToken } = require('./get-management-token');

const getAppInfo = async (options) => {
  const { host } = options;
  const accessToken = options.token || (await getManagementToken(host));
  const client = createClient({ accessToken, host });

  const organization = options.organizationId
    ? await getOrganizationById(client, options.organizationId)
    : await selectOrganization(client);

  const definition = options.definitionId
    ? await getDefinitionById(client, organization.value, options.definitionId)
    : await selectDefinition(client, organization.value);

  return {
    accessToken,
    organization,
    definition,
  };
};

module.exports = {
  getAppInfo,
};
