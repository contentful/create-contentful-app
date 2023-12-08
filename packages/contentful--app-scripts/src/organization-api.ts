import ora from 'ora';
import { selectFromList, throwError } from './utils';
import { ORG_ID_ENV_KEY } from './constants';
import { ClientAPI } from 'contentful-management';

export interface Organization {
  name: string,
  value: string,
}

async function fetchOrganizations(client: ClientAPI): Promise<Organization[]> {
  try {
    const orgs = await client.getOrganizations();

    return orgs.items.map((org) => ({
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

export async function selectOrganization(client: ClientAPI): Promise<Organization> {
  const orgSpinner = ora('Fetching your organizations...').start();

  try {
    const organizations = await fetchOrganizations(client);
    orgSpinner.stop();
    return await selectFromList(organizations, 'Select an organization:', ORG_ID_ENV_KEY);
  } finally {
    orgSpinner.stop();
  }
}

export async function getOrganizationById(client: ClientAPI, orgId: string): Promise<Organization> {
  try {
    const org = await client.getOrganization(orgId);
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
