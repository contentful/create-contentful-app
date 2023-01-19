import { spawn, SpawnOptionsWithoutStdio } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { basename } from 'path';
import { choice, highlight, warn } from './logger';
import { CLIOptions } from './types';

const MUTUALLY_EXCLUSIVE_OPTIONS = [
  'source',
  'example',
  'template',
  'typescript',
  'javascript',
] as const;

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
    delete normalizedOptions.template;
    delete normalizedOptions.typescript;
    delete normalizedOptions.javascript;
  }

  if (normalizedOptions.example) {
    fallbackOption = '--example';
    delete normalizedOptions.template;
    delete normalizedOptions.typescript;
    delete normalizedOptions.javascript;
  }

  if (normalizedOptions.template) {
    fallbackOption = '--template';
    delete normalizedOptions.typescript;
    delete normalizedOptions.javascript;
  }

  if (normalizedOptions.typescript) {
    fallbackOption = '--typescript';
    delete normalizedOptions.javascript;
  }

  if (currentMutuallyExclusiveOptions.length > 1) {
    const paramsString = `Options ${currentMutuallyExclusiveOptions
      .slice(0, -1)
      .map((option) => highlight(`--${option}`))
      .join(', ')} and ${highlight(
      `--${currentMutuallyExclusiveOptions.slice(-1)}`
    )} are mutually exclusive, using ${choice(fallbackOption)}.`;
    warn(paramsString);
  }

  return normalizedOptions;
}
