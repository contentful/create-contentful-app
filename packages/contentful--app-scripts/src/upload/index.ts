import { activateBundle } from '../activate/activate-bundle';
import { getUploadSettingsArgs } from './get-upload-settings-args';
import { createAppBundleFromSettings } from './create-app-bundle';
import { buildAppUploadSettings } from './build-upload-settings';
import { Organization } from '../organization-api';
import { Definition } from '../definition-api';
import { FunctionAppAction } from '../utils';

export interface UploadOptions {
  organizationId?: string;
  definitionId?: string;
  token?: string;
  bundleDir?: string;
  comment?: string;
  skipActivation?: boolean;
  host?: string;
  userAgentApplication?: string;
}

export interface UploadSettings {
  organization: Organization;
  definition: Definition;
  accessToken: string;
  comment?: string;
  bundleDirectory: string;
  skipActivation?: boolean;
  userAgentApplication?: string;
  host?: string;
  actions?: FunctionAppAction[];
}

async function uploadAndActivate(settings: UploadSettings) {
  const bundle = await createAppBundleFromSettings(settings);
  if (!settings.skipActivation && bundle) {
    await activateBundle({ ...settings, bundleId: bundle.sys.id });
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
