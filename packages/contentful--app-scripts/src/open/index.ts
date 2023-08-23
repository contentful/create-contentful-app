import { OpenSettingsOptions } from '../types';
import { openSettings } from './open-settings';

const interactive = async (options: OpenSettingsOptions) => {
  openSettings(options);
};

const nonInteractive = async () => {
  throw new Error(`"open-settings" is not available in non-interactive mode`);
};

export const open = {
  interactive,
  nonInteractive,
};
