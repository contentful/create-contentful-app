import { getCleanUpSettingsArgs } from './get-clean-up-settings';
import { buildCleanUpSettings } from './build-clean-up-settings';
import { cleanUpBundles } from './clean-up-bundles';
import { CleanupOptions } from '../types';

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
