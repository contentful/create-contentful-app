import { spawn, SpawnOptionsWithoutStdio } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { basename } from 'path';
import { choice, highlight, warn } from './logger';
import { CLIOptions } from './types';

const MUTUALLY_EXCLUSIVE_OPTIONS = ['source', 'example', 'Js', 'Ts'] as const;

export function exec(command: string, args: string[], options: SpawnOptionsWithoutStdio) {
  return new Promise<void>((resolve, reject) => {
    const process = spawn(command, args, { stdio: 'inherit', ...options });
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

  const mutuallyExclusiveOptions = [];
  let fallbackOption = '--typescript';

  MUTUALLY_EXCLUSIVE_OPTIONS.forEach((option) => {
    if (normalizedOptions[option]) {
      mutuallyExclusiveOptions.push(option);
    }
  });

  if (normalizedOptions.source) {
    fallbackOption = '--source';
    delete normalizedOptions.example;
    delete normalizedOptions.Ts;
    delete normalizedOptions.Js;
  }

  if (normalizedOptions.example) {
    fallbackOption = '--example';
    delete normalizedOptions.Ts;
    delete normalizedOptions.Js;
  }

  if (normalizedOptions.Ts) {
    fallbackOption = '--typescript';
    delete normalizedOptions.Js;
  }

  if (!normalizedOptions.Js) {
    normalizedOptions.Ts = true;
  }

  if (mutuallyExclusiveOptions.length > 1) {
    warn(
      `Options ${highlight('--source')}, ${highlight('--example')}, ${highlight('--typescript')} and ${highlight('--javascript')} are mutually exclusive, using ${choice(fallbackOption)}.`
    );
  }

  return normalizedOptions;
}
