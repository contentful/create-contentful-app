import { activateBundle } from './activate-bundle';
import { getActivateSettingsArgs } from './get-activate-args';
import { buildBundleActivateSettings } from './build-bundle-activate-settings';
import { Organization } from '../organization-api';
import { Definition } from '../definition-api';

export interface ActivateOptions {
  bundleId: string;
  organizationId?: string;
  definitionId?: string;
  token?: string;
  host?: string;
}

export interface ActivateSettings {
  bundleId: string;
  organization: Organization;
  definition: Definition;
  accessToken: string;
  host?: string;
}

const interactive = async (options: ActivateOptions) => {
  const settings = await buildBundleActivateSettings(options);
  await activateBundle(settings);
};

const nonInteractive = async (options: ActivateOptions) => {
  const settings = await getActivateSettingsArgs(options);

  await activateBundle(settings);
};

export default {
  interactive,
  nonInteractive,
};
