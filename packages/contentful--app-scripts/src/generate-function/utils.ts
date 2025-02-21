import { EXAMPLES_PATH } from './constants';
import { choice, error, highlight, warn } from './logger';
import { CLIOptions, ContentfulExample } from './types';

const MUTUALLY_EXCLUSIVE_OPTIONS = ['typescript', 'javascript'] as const;

export function normalizeOptions(options: CLIOptions): CLIOptions {
  const normalizedOptions: CLIOptions = { ...options };

  if (normalizedOptions.npm && normalizedOptions.yarn) {
    warn(
      `Provided both ${highlight('--yarn')} and ${highlight('--npm')} flags, using ${choice(
        '--npm'
      )}.`
    );
    delete normalizedOptions.yarn;
  }

  if (!normalizedOptions.yarn) {
    normalizedOptions.npm = true;
  }

  let fallbackOption = '--typescript';

  const currentMutuallyExclusiveOptions = MUTUALLY_EXCLUSIVE_OPTIONS.filter(
    (option) => normalizedOptions[option]
  );

  if (normalizedOptions.source) {
    fallbackOption = '--source';
    delete normalizedOptions.example;
    delete normalizedOptions.typescript;
    delete normalizedOptions.javascript;
  }

  if (normalizedOptions.example) {
    fallbackOption = '--example';
    delete normalizedOptions.typescript;
    delete normalizedOptions.javascript;
  }

  if (normalizedOptions.typescript) {
    fallbackOption = '--typescript';
    delete normalizedOptions.javascript;
  }

  if (currentMutuallyExclusiveOptions.length > 1) {
    const paramsString = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(
      currentMutuallyExclusiveOptions.map((option) => highlight(`--${option}`))
    );
    warn(`Options ${paramsString} are mutually exclusive, using ${choice(fallbackOption)}.`);
  }

  return normalizedOptions;
}

export function isContentfulTemplate(url: string) {
  return Object.values(ContentfulExample).some((t) => url.includes(EXAMPLES_PATH + t));
}
