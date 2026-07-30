import ora from 'ora';
import { selectFromList, throwError } from './utils';
import { ORG_ID_ENV_KEY } from './constants';
import { OrganizationProps, PlainClientAPI } from 'contentful-management';

export interface Organization {
  name: string;
  value: string;
}

async function fetchOrganizations(client: PlainClientAPI): Promise<Organization[]> {
  try {
    const batchedOrganizations: OrganizationProps[] = [];
    let skip = 0;
    let totalNumOfOrganizations = 0;

    while (skip === 0 || batchedOrganizations.length < totalNumOfOrganizations) {
      const organizationsResponse = await client.organization.getAll({
        query: { skip, limit: 100 },
      });

      totalNumOfOrganizations = organizationsResponse.total;
      batchedOrganizations.push(...organizationsResponse.items);

      skip += 100;
    }

    return batchedOrganizations.map((org) => ({
      name: org.name,
      value: org.sys.id,
    }));
  } catch (err: any) {
    return throwError(
      err,
      'Could not fetch your organizations. Make sure you provided a valid access token.'
    );
  }
}

export async function selectOrganization(client: PlainClientAPI): Promise<Organization> {
  const orgSpinner = ora('Fetching your organizations...').start();

  try {
    const organizations = await fetchOrganizations(client);
    orgSpinner.stop();
    return await selectFromList(organizations, 'Select an organization:', ORG_ID_ENV_KEY);
  } finally {
    orgSpinner.stop();
  }
}

export async function getOrganizationById(
  client: PlainClientAPI,
  orgId: string
): Promise<Organization> {
  try {
    const org = await client.organization.get({ organizationId: orgId });
    return {
      name: org.name,
      value: org.sys.id,
    };
  } catch (err: any) {
    return throwError(
      err,
      'Could not fetch your organization. Make sure you provided a valid access token.'
    );
  }
}
