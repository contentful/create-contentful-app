import { buildAppDefinitionSettings } from './build-app-definition-settings';
import { createAppDefinition as create } from './create-app-definition';
import { getManagementToken } from '../get-management-token';

const interactive = async () => {
  const appDefinitionSettings = await buildAppDefinitionSettings();
  const managementToken = await getManagementToken(appDefinitionSettings.host);

  return create(managementToken, appDefinitionSettings);
};

const nonInteractive = async () => {
  throw new Error(`"create-app-definition" is not available in non-interactive mode`);
};

export const createAppDefinition = {
  interactive,
  nonInteractive,
};
