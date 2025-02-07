import { error, highlight } from './logger';
import { CLIOptions, InvalidCLIOptionsError } from './types';

const MUTUALLY_EXCLUSIVE_OPTIONS = ['typescript', 'javascript'] as const;

export function normalizeOptions(options: CLIOptions): CLIOptions {
  const normalizedOptions: CLIOptions = { ...options };


  const currentMutuallyExclusiveOptions = MUTUALLY_EXCLUSIVE_OPTIONS.filter(
    (option) => normalizedOptions[option]
  );

  if (normalizedOptions.typescript) {
    delete normalizedOptions.javascript;
  } else if (normalizedOptions.javascript) {
    delete normalizedOptions.typescript;
  }

  if (currentMutuallyExclusiveOptions.length > 1) {
    const paramsString = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(
      currentMutuallyExclusiveOptions.map((option) => highlight(`--${option}`))
    );
    error(`Options ${paramsString} are mutually exclusive. Use --help.`, InvalidCLIOptionsError);
  }

  return normalizedOptions;
}
