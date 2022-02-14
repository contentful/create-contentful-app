#!/usr/bin/env node

/* eslint-disable no-console, no-process-exit */

import chalk from 'chalk';
import degit from 'degit';
import { readFileSync, writeFileSync } from 'fs';
import { basename, resolve } from 'path';
import tildify from 'tildify';
import { exec, rmIfExists, detectManager } from './utils.js';
import os from 'os';
import validateAppName from 'validate-npm-package-name';
import { program } from 'commander';
import inquirer from 'inquirer';

function successMessage(folder) {
  console.log(`
${chalk.cyan('Success!')} Created a new Contentful app in ${chalk.bold(tildify(folder))}.

We suggest that you begin by running:

    ${chalk.cyan(`cd ${folder}`)}
    ${chalk.cyan(`npm start`)}
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

async function promptAppName() {
  return await inquirer.prompt([
    {
      name: 'name',
      message: 'App name',
      default: 'contentful-app',
    },
  ]);
}

async function initProject(appName, options) {
  try {
    if (appName === 'create-definition') {
      throw new Error(
        `The ${chalk.bold('create-definition')} command has been removed from ${chalk.cyan(
          'create-contentful-app'
        )}.`
      );
    }

    if (appName === 'init') {
      console.log(
        `${chalk.yellow('Warning:')} The ${chalk.bold(
          'init'
        )} command has been removed from ${chalk.cyan(
          'create-contentful-app'
        )}. You can now create new apps running ${chalk.cyan(
          'npx create-contentful-app'
        )} directly.`
      );
      appName = undefined;
    }

    if (!appName) {
      const prompt = await promptAppName();
      appName = prompt.name;
    }

    if (!validateAppName(appName).validForNewPackages) {
      throw new Error(
        `Cannot create an app named "${appName}". Please choose a different name for your app.`
      );
    }

    const fullAppFolder = resolve(process.cwd(), appName);

    console.log(`Creating a Contentful app in ${chalk.bold(tildify(fullAppFolder))}.`);

    if (options.npm && options.yarn) {
      console.log(
        `${chalk.yellow('Warning:')} Provided both ${chalk.bold('--yarn')} and ${chalk.bold(
          '--npm'
        )} flags, using ${chalk.greenBright('--npm')}.`
      );
    }

    if (options.Js && options.Ts) {
      console.log(
        `${chalk.yellow('Warning:')} Provided both ${chalk.bold('--javascript')} and ${chalk.bold(
          '--typescript'
        )} flags, using ${chalk.greenBright('--typescript')}.`
      );
    }

    const templateType = options.Js ? 'javascript' : 'typescript';
    await cloneTemplate(templateType, fullAppFolder);

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
    .name(`npx ${chalk.cyan('@contentful/create-contentful-app')}`)
    .helpOption(true)
    .description('bootstraps your app into a newly created directory')
    .argument('[app-name]', 'app name')
    .option('--npm', 'use NPM')
    .option('--yarn', 'use Yarn')
    .option('--javascript, -js', 'use JavaScript')
    .option('--typescript, -ts', 'use TypeScript')
    .action(initProject);

  await program.parseAsync();
})();
