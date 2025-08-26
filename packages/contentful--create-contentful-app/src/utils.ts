import { spawn, SpawnOptionsWithoutStdio } from 'child_process';
import { existsSync, readFileSync, rmSync } from 'fs';
import { basename } from 'path';
import { choice, highlight, warn } from './logger';
import { CLIOptions, ContentfulExample, PackageManager } from './types';
import { EXAMPLES_PATH } from './constants';

const MUTUALLY_EXCLUSIVE_OPTIONS = ['source', 'example', 'typescript', 'javascript'] as const;

export function exec(command: string, args: string[], options: SpawnOptionsWithoutStdio) {
  return new Promise<void>((resolve, reject) => {
    const process = spawn(command, args, { stdio: 'inherit', shell: true, ...options });
    process.on('exit', (exitCode) => {
      if (exitCode === 0) {
        resolve();
      } else {
        reject();
      }
    });
  });
}

export function rmIfExists(path: string) {
  if (existsSync(path)) {
    rmSync(path);
  }
}

export function detectActivePackageManager(): PackageManager {
  if (existsSync('pnpm-lock.yaml')) return 'pnpm';
  if (existsSync('yarn.lock')) return 'yarn';
  if (existsSync('package-lock.json')) return 'npm';
  warn('No lock files found, we will try to detect the active package manager from package.json.');
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    if (pkg.packageManager?.startsWith('pnpm')) return 'pnpm';
    if (pkg.packageManager?.startsWith('yarn')) return 'yarn';
    if (pkg.packageManager?.startsWith('npm')) return 'npm';
  } catch {
    warn(
      `Unable to determine active package manager from package.json. We will try to detect it from npm_execpath.`
    );
  }

  switch (basename(process.env.npm_execpath || '')) {
    case 'yarn.js':
      return 'yarn';
    case 'pnpm.cjs':
      return 'pnpm';
    case 'npx-cli.js':
    case 'npm-cli.js':
    default:
      return 'npm';
  }
}

// By the time this function is called, the options have already been normalized
// so we would not need to consider multiple package manager flags at once
export function getNormalizedPackageManager(
  options: CLIOptions,
  activePackageManager: PackageManager
): PackageManager {
  // Prefer to get the package manager from options
  if (options.pnpm) {
    return 'pnpm';
  } else if (options.yarn) {
    return 'yarn';
  } else if (options.npm) {
    return 'npm';
  }

  // Fallback to active package manager
  return activePackageManager;
}

export function normalizeOptions(options: CLIOptions): CLIOptions {
  const normalizedOptions: CLIOptions = { ...options };

  const selectedPackageManagers = [
    ['npm', normalizedOptions.npm],
    ['pnpm', normalizedOptions.pnpm],
    ['yarn', normalizedOptions.yarn],
  ].filter(([, n]) => n);
  const activePackageManager = detectActivePackageManager();

  if (selectedPackageManagers.length > 1) {
    warn(
      `Too many package manager flags were provided, we will use ${choice(
        `--${activePackageManager}`
      )}.`
    );

    // Delete all package manager options
    selectedPackageManagers.forEach(([packageManager]) => {
      delete normalizedOptions[packageManager as keyof CLIOptions];
    });

    // Select active package manager
    (normalizedOptions as CLIOptions)[activePackageManager] = true;
  }

  // No package manager flags were provided, use active package manager
  if (selectedPackageManagers.length === 0) {
    (normalizedOptions as CLIOptions)[activePackageManager] = true;
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
    delete normalizedOptions.function;
  }

  if (normalizedOptions.example) {
    fallbackOption = '--example';
    delete normalizedOptions.typescript;
    delete normalizedOptions.javascript;
    delete normalizedOptions.function;
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
