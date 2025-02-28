import { spawn, SpawnOptionsWithoutStdio } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { basename } from 'path';
import { choice, highlight, warn } from './logger';
import { CLIOptions, ContentfulExample } from './types';
import { CURRENT_VERSION, examples_path, LEGACY_VERSION, NEWEST_VERSION, NEXT_VERSION, templates_path } from './constants';

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

export function detectManager() {
  switch (basename(process.env.npm_execpath || '')) {
    case 'yarn.js':
      return 'yarn';
    case 'npx-cli.js':
    case 'npm-cli.js':
    default:
      return 'npm';
  }
}

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

  if (!normalizedOptions.version) { // version takes precedence over legacy
    if (normalizedOptions.legacy) {
      normalizedOptions.version = LEGACY_VERSION;
    }  else if (normalizedOptions.next) {
      normalizedOptions.version = NEXT_VERSION
    } else {
        normalizedOptions.version = CURRENT_VERSION;
    }
  } else {
    const version = parseInt(normalizedOptions.version);
    const newestVersion = parseInt(NEWEST_VERSION);
    if (isNaN(version) || version > newestVersion || version <= 0) {
    warn(
      `Provided version ${highlight(normalizedOptions.version)} does not exist, using ${choice(
        NEWEST_VERSION
      )} instead.`
    );
    normalizedOptions.version = NEWEST_VERSION
  }
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
    delete normalizedOptions.action;
    delete normalizedOptions.function;
  }

  if (normalizedOptions.example) {
    fallbackOption = '--example';
    delete normalizedOptions.typescript;
    delete normalizedOptions.javascript;
    delete normalizedOptions.action;
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
  return Object.values(ContentfulExample).some((t) => 
    url.includes(templates_path("1") + t)) || url.includes(templates_path("2")) || url.includes(examples_path("1")) || url.includes(examples_path("2"));  
}
