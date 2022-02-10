#!/usr/bin/env node

/* eslint-disable no-console, no-process-exit */

import { createAppDefinition } from '@contentful/app-scripts';
import chalk from 'chalk';
import degit from 'degit';
import { readFileSync, writeFileSync } from 'fs';
import { basename, resolve } from 'path';
import tildify from 'tildify';
import os from 'os';
import validateAppName from 'validate-npm-package-name';
import { program } from 'commander';
import { exec, rmIfExists, printHelpText } from './utils.js';

const command = process.argv[2];

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

async function initProject() {
  const appName = process.argv[3];

  try {
    if (!appName) {
      throw new Error(`Please provide a name for your app, e.g. \`${mainCommand} init my-app\``);
    }

    if (!validateAppName(appName).validForNewPackages) {
      throw new Error(
        `Cannot create an app named "${appName}". Please choose a different name for your app.`
      );
    }

    const fullAppFolder = resolve(process.cwd(), appName);

    console.log(`Creating a Contentful app in ${chalk.bold(tildify(fullAppFolder))}.`);

    program
      .option('--javascript, -js')
      .option('--typescript, -ts')
      .action(async (opts) => {
        const templateType = opts.Js ? 'javascript' : 'typescript';
        await cloneTemplate(templateType, fullAppFolder);
      })

    await program.parseAsync();

    rmIfExists(resolve(fullAppFolder, 'package-lock.json'));
    rmIfExists(resolve(fullAppFolder, 'yarn.lock'));
    updatePackageName(fullAppFolder);

    await exec('npm', ['install'], { cwd: fullAppFolder });

    successMessage(fullAppFolder);
  } catch (err) {
    console.log(`${chalk.red('Error:')} Failed to create ${appName}

  ${err}
`);
    process.exit(1);
  }
}


(async function main() {

  switch (command) {
    case 'init':
      await initProject();
      break;

    case 'create-definition':
      await createAppDefinition.interactive();
      break;

    case 'help':
      printHelpText(mainCommand, localCommand);
      break;

    case undefined:
      printHelpText(mainCommand, localCommand);
      break;

    default:
      console.log();
      console.log(`${chalk.red('Error:')} Unknown command.`);
      printHelpText();
      process.exit(1);
  }
})();
