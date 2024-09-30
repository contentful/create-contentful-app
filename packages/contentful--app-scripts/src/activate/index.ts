import { activateBundle } from './activate-bundle';
import { getActivateSettingsArgs } from './get-activate-args';
import { buildBundleActivateSettings } from './build-bundle-activate-settings';
import { ActivateOptions } from '../types';
import { logFeedbackNudge } from '../feedback/feedback';

const interactive = async (options: ActivateOptions) => {
  const settings = await buildBundleActivateSettings(options);
  await activateBundle(settings);
  logFeedbackNudge();
};

const nonInteractive = async (options: ActivateOptions) => {
  const settings = await getActivateSettingsArgs(options);
  await activateBundle(settings);
  logFeedbackNudge();
};

export const activate = {
  interactive,
  nonInteractive,
};
