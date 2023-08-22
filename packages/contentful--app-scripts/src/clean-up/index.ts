import { getCleanUpSettingsArgs } from './get-clean-up-settings';
import { buildCleanUpSettings } from './build-clean-up-settings';
import { cleanUpBundles } from './clean-up-bundles';
import { Organization } from '../organization-api';
import { Definition } from '../definition-api';

export interface CleanupOptions {
  organizationId?: string;
  definitionId?: string;
  token?: string;
  host?: string;
  keep?: string;
}

export interface CleanupSettings {
  keep: number;
  host?: string;
  accessToken: string;
  organization: Organization;
  definition: Definition;
}

const interactive = async (options: CleanupOptions) => {
  const settings = await buildCleanUpSettings(options);
  await cleanUpBundles(settings);
};

const nonInteractive = async (options: CleanupOptions) => {
  const settings = await getCleanUpSettingsArgs(options);
  await cleanUpBundles(settings);
};

export const cleanup = {
  interactive,
  nonInteractive,
};
