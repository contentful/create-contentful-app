import { spawn } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { basename } from 'path';

export function exec(command, args, options) {
  return new Promise((resolve, reject) => {
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

export function rmIfExists(path) {
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
