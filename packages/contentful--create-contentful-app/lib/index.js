#!/usr/bin/env node

/* eslint-disable no-console, no-process-exit */

import { createAppDefinition } from '@contentful/app-scripts';
import chalk from 'chalk';
import degit from 'degit';
import { readFileSync, writeFileSync } from 'fs';
import { basename, resolve } from 'path';
import tildify from 'tildify';
import { exec, rmIfExists, detectManager } from './utils.js';
import os from 'os';
import validateAppName from 'validate-npm-package-name';
import { program } from 'commander';

const localCommand = '@contentful/create-contentful-app';
const mainCommand = `npx ${localCommand}`;

function successMessage(folder) {
  console.log(`
${chalk.cyan('Success!')} Created a new Contentful app in ${chalk.bold(tildify(folder))}.

We suggest that you begin by running:

    ${chalk.cyan(`cd ${folder}`)}
    ${chalk.cyan(`${mainCommand} create-definition`)}
  `);
}

function updatePackageName(appFolder) {
  const packageJsonPath = resolve(appFolder, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, { encoding: 'utf-8' }));
  packageJson.name = basename(appFolder);
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + os.EOL);
}

async function cloneTemplate(name, destination) {
  const d = degit(`contentful/apps/templates/${name}`, { mode: 'tar' });

  try {
    await d.clone(destination);
  } catch (e) {
    let message = 'Error creating app';
    if (e.code === 'DEST_NOT_EMPTY') {
      message = 'destination directory is not empty';
    }
    throw new Error(message);
  }
}

async function initProject(appName, options) {
  try {
    if (!validateAppName(appName).validForNewPackages) {
      throw new Error(
        `Cannot create an app named "${appName}". Please choose a different name for your app.`
      );
    }

    if (options.npm && options.yarn) {
      throw new Error(
        `Please provide either ${chalk.bold('--yarn')} or ${chalk.bold('--npm')} flag, but not both`
      );
    }

    const fullAppFolder = resolve(process.cwd(), appName);

    console.log(`Creating a Contentful app in ${chalk.bold(tildify(fullAppFolder))}.`);

    await cloneTemplate('typescript', fullAppFolder);

    rmIfExists(resolve(fullAppFolder, 'package-lock.json'));
    rmIfExists(resolve(fullAppFolder, 'yarn.lock'));
    updatePackageName(fullAppFolder);

    const useYarn = (options.yarn || detectManager() === 'yarn') && !options.npm;

    if (useYarn) {
      await exec('yarn', [], { cwd: fullAppFolder });
    } else {
      await exec('npm', ['install'], { cwd: fullAppFolder });
    }

    successMessage(fullAppFolder);
  } catch (err) {
    console.log(`${chalk.red('Error:')} Failed to create ${appName}

  ${err}
`);
    process.exit(1);
  }
}

(async function main() {
  program
    .command('init', { isDefault: true, hidden: true })
    .description('Bootstrap your app inside a new folder ‘app-name’')
    .argument('[app-name]', 'App name')
    .option('--npm', 'Use NPM')
    .option('--yarn', 'Use Yarn')
    .action(initProject);

  program
    .command('create-definition')
    .description(
      'Creates an app definition for your app in a Contentful organization of your choice.'
    )
    .action(async () => {
      await createAppDefinition.interactive();
    });

  program
    .name(chalk.cyan('@contentful/create-contentful-app'))
    .usage(chalk.cyan('[options] {[app-name]|[command]}'))
    .helpOption(false);

  await program.parseAsync();
})();
