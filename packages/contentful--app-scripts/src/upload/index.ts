import { activateBundle } from '../activate/activate-bundle';
import { getUploadSettingsArgs } from './get-upload-settings-args';
import { createAppBundleFromSettings } from './create-app-bundle';
import { buildAppUploadSettings } from './build-upload-settings';
import { UploadOptions, UploadSettings } from '../types';
import { logFeedbackNudge } from '../feedback/feedback';

function uploadSettingsHaveAppEventFunction(settings: UploadSettings) {
  return (
    settings.functions &&
    settings.functions.some((fn) => fn.accepts.some((fnType) => fnType.startsWith('appevent')))
  );
}

async function uploadAndActivate(settings: UploadSettings) {
  const bundle = await createAppBundleFromSettings(settings);
  if (uploadSettingsHaveAppEventFunction(settings)) {
    console.log(
      'Remember that, in order to be invoked, your App Event function(s) must be linked to your App Event subscription using the CMA or the Events tab of the App Details page.'
    );
  }
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
