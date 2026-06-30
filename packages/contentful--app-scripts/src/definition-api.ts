import ora from 'ora';
import { selectFromList, throwError } from './utils';
import { APP_DEF_ENV_KEY } from './constants';
import { AppDefinitionProps, PlainClientAPI } from 'contentful-management';

export interface Definition {
  name: string;
  value: string;
  locations: string[];
}

async function fetchDefinitions(client: PlainClientAPI, orgId: string): Promise<Definition[]> {
  try {
    const batchedAppDefinitions: AppDefinitionProps[] = [];
    let skip = 0;
    let totalNumOfAppDefinitions = 0;

    while (skip === 0 || batchedAppDefinitions.length < totalNumOfAppDefinitions) {
      const appDefinitionsResponse = await client.appDefinition.getMany({
        organizationId: orgId,
        query: { skip, limit: 100 },
      });

      totalNumOfAppDefinitions = appDefinitionsResponse.total;
      batchedAppDefinitions.push(...appDefinitionsResponse.items);

      skip += 100;
    }

    return batchedAppDefinitions.map((def) => ({
      name: def.name,
      value: def.sys.id,
      locations: def.locations ? def.locations.map((location) => location.location) : [],
    }));
  } catch (err: any) {
    return throwError(
      err,
      'Could not fetch your app-definitions. Make sure you provided a valid access token.'
    );
  }
}

export async function selectDefinition(client: PlainClientAPI, orgId: string): Promise<Definition> {
  const defSpinner = ora('Fetching all definitions...').start();
  const definitions = await fetchDefinitions(client, orgId);
  defSpinner.stop();

  return await selectFromList(definitions as Definition[], 'Select an app:', APP_DEF_ENV_KEY);
}

export async function getDefinitionById(
  client: PlainClientAPI,
  orgId: string,
  defId: string
): Promise<Definition> {
  try {
    const definition = await client.appDefinition.get({
      organizationId: orgId,
      appDefinitionId: defId,
    });
    return {
      name: definition.name,
      value: definition.sys.id,
      locations: definition.locations
        ? definition.locations.map((location) => location.location)
        : [],
    };
  } catch (err: any) {
    return throwError(
      err,
      'Could not fetch your app-definition. Make sure you provided a valid definition id or access token.'
    );
  }
}
