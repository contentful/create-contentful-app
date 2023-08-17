import ora from 'ora';
import { selectFromList, throwError } from './utils';
import { APP_DEF_ENV_KEY } from '../utils/constants';
import { ClientAPI } from 'contentful-management';

export interface Definition {
  name: string,
  value: string,
}

async function fetchDefinitions(client: ClientAPI, orgId: string): Promise<Definition[]> {
  try {
    const organization = await client.getOrganization(orgId);
    const definitions = await organization.getAppDefinitions();
    return definitions.items.map((def) => ({
      name: def.name,
      value: def.sys.id,
    }));
  } catch (err: any) {
    return throwError(
      err,
      'Could not fetch your app-definitions. Make sure you provided a valid access token.'
    );
  }
}

export async function selectDefinition(client: ClientAPI, orgId: string): Promise<Definition> {
  const defSpinner = ora('Fetching all definitions...').start();
  const definitions = await fetchDefinitions(client, orgId);
  defSpinner.stop();

  return await selectFromList(definitions as Definition[], 'Select an app:', APP_DEF_ENV_KEY);
}

export async function getDefinitionById(client: ClientAPI, orgId: string, defId: string): Promise<Definition> {
  try {
    const organization = await client.getOrganization(orgId);
    const definition = await organization.getAppDefinition(defId);
    return {
      name: definition.name,
      value: definition.sys.id,
    };
  } catch (err: any) {
    return throwError(
      err,
      'Could not fetch your app-definition. Make sure you provided a valid definition id or access token.'
    );
  }
}
