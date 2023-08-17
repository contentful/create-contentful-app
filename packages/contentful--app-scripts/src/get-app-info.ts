import { getDefinitionById, selectDefinition } from './definition-api';
import { selectOrganization, getOrganizationById } from './organization-api';
import { createClient } from 'contentful-management';
import { getManagementToken } from './get-management-token';

export const getAppInfo = async (
  {
    organizationId,
    definitionId,
    token,
    host,
  }: {
    organizationId?: string;
    definitionId?: string;
    token?: string;
    host?: string;
  },
) => {
  const accessToken = token || (await getManagementToken(host));
  const client = createClient({ accessToken, host });

  const organization = organizationId
    ? await getOrganizationById(client, organizationId)
    : await selectOrganization(client);

  const definition = definitionId
    ? await getDefinitionById(client, organization.value, definitionId)
    : await selectDefinition(client, organization.value);

  return {
    accessToken,
    organization,
    definition,
  };
};
