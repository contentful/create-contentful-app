#!/usr/bin/env node

/* eslint-disable no-console, no-process-exit */

import { createAppDefinition } from '@contentful/app-scripts';
import chalk from 'chalk';
import degit from 'degit';
import { readFileSync, writeFileSync } from 'fs';
import { basename, resolve } from 'path';
import tildify from 'tildify';
import { exec, rmIfExists } from './utils.js';
import os from 'os';

const command = process.argv[2];

const localCommand = '@contentful/create-contentful-app';
const mainCommand = `npx ${localCommand}`;

function successMessage(folder) {
  console.log(`
${chalk.cyan('Success!')} Created a new Contentful app in ${chalk.bold(
    tildify(resolve(process.cwd(), folder))
  )}.

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
  const d = degit(`contentful/apps/examples/templates/${name}`, { mode: 'tar' });

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

async function initProject() {
  const appFolder = process.argv[3];
  const fullAppFolder = resolve(process.cwd(), appFolder);

  try {
    if (!appFolder) {
      console.log();
      console.log(
        `Please provide a name for your app, e.g. ${chalk.cyan(`\`${mainCommand} init my-app\``)}.`
      );
      console.log();
      process.exit(1);
    }

    console.log(`Creating a Contentful app in ${chalk.bold(tildify(fullAppFolder))}.`);

    await cloneTemplate(
      'typescript-template#ext-3435', // TODO: needs to be adjusted once PR is merged
      fullAppFolder
    );

    rmIfExists(resolve(fullAppFolder, 'package-lock.json'));
    rmIfExists(resolve(fullAppFolder, 'yarn.lock'));
    updatePackageName(fullAppFolder);

    await exec('npm', ['install'], { cwd: fullAppFolder });

    successMessage(appFolder);
  } catch (err) {
    console.log(`${chalk.red('Error:')} Failed to create ${appFolder}

  ${err}
`);
    process.exit(1);
  }
}

(async function main() {
  function printHelpText() {
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

  switch (command) {
    case 'init':
      await initProject();
      break;

    case 'create-definition':
      await createAppDefinition.interactive();
      break;

    case 'help':
      printHelpText();
      break;

    case undefined:
      printHelpText();
      break;

    default:
      console.log();
      console.log(`${chalk.red('Error:')} Unknown command.`);
      printHelpText();
      process.exit(1);
  }
})();
