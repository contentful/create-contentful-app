import { openSettings } from './open-settings';

export interface OpenSettingsOptions {
  definitionId?: string;
}

const interactive = async (options: OpenSettingsOptions) => {
  openSettings(options);
};

const nonInteractive = async () => {
  throw new Error(`"open-settings" is not available in non-interactive mode`);
};

export default {
  interactive,
  nonInteractive,
};
