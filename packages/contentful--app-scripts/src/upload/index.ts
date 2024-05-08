import { activateBundle } from '../activate/activate-bundle';
import { getUploadSettingsArgs } from './get-upload-settings-args';
import { createAppBundleFromSettings } from './create-app-bundle';
import { buildAppUploadSettings } from './build-upload-settings';
import { UploadOptions, UploadSettings } from '../types';
import { logFeedbackNudge } from '../feedback/feedback';

async function uploadAndActivate(settings: UploadSettings) {
  const bundle = await createAppBundleFromSettings(settings);
  if (!settings.skipActivation && bundle) {
    await activateBundle({ ...settings, bundleId: bundle.sys.id });
    logFeedbackNudge();
  }
}

const interactive = async (options: UploadOptions) => {
  const settings = await buildAppUploadSettings(options);
  await uploadAndActivate(settings);
};

const nonInteractive = async (options: UploadOptions) => {
  const settings = await getUploadSettingsArgs(options);
  await uploadAndActivate(settings);
};

export const upload = {
  interactive,
  nonInteractive,
};
