import { activateBundle } from './activate-bundle';
import { getActivateSettingsArgs } from './get-activate-args';
import { buildBundleActivateSettings } from './build-bundle-activate-settings';
import { ActivateOptions } from '../types';

const interactive = async (options: ActivateOptions) => {
  const settings = await buildBundleActivateSettings(options);
  await activateBundle(settings);
};

const nonInteractive = async (options: ActivateOptions) => {
  const settings = await getActivateSettingsArgs(options);

  await activateBundle(settings);
};

export const activate = {
  interactive,
  nonInteractive,
};
