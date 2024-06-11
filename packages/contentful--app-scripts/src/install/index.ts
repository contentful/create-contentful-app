import { InstallOptions } from '../types';
import { installToEnvironment } from './install';

const interactive = async (options: InstallOptions) => {
  installToEnvironment(options);
};

const nonInteractive = async () => {
  throw new Error(`"install" is not available in non-interactive mode`);
};

export const install = {
  interactive,
  nonInteractive,
};
