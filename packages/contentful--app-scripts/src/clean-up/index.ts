import { getCleanUpSettingsArgs } from './get-clean-up-settings';
import { buildCleanUpSettings } from './build-clean-up-settings';
import { cleanUpBundles } from './clean-up-bundles';
import { Organization } from '../organization-api';
import { Definition } from '../definition-api';

export interface CleanupSettings {
  keep: number;
  host: string | undefined;
  accessToken: string;
  organization: Organization;
  definition: Definition;
}

const interactive = async (options: Record<string, string>) => {
  const settings = await buildCleanUpSettings(options);
  await cleanUpBundles(settings);
};

const nonInteractive = async (options: Record<string, string>) => {
  const settings = await getCleanUpSettingsArgs(options);
  await cleanUpBundles(settings);
};

export default {
  interactive,
  nonInteractive,
};
