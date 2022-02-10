import { spawn } from 'child_process';
import chalk from 'chalk';
import { existsSync, rmSync } from 'fs';

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

export function printHelpText(mainCommand, localCommand) {
  console.log(`
${chalk.bold(localCommand)}

${chalk.dim('Available commands:')}

${chalk.cyan(`$ ${mainCommand} init app-name`)}

Bootstraps your app inside a new folder "app-name".

${chalk.cyan(`$ ${mainCommand} create-definition`)}

Creates an app definition for your app in a Contentful
organization of your choice.
`);
}

export function rmIfExists(path) {
  if (existsSync(path)) {
    rmSync(path);
  }
}
