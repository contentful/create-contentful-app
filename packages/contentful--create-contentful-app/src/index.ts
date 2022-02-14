#!/usr/bin/env node

import { createAppDefinition } from '@contentful/app-scripts';
import chalk from 'chalk';
import { readFileSync, writeFileSync } from 'fs';
import { basename, resolve } from 'path';
import { EOL } from 'os';
import validateAppName from 'validate-npm-package-name';
import { program } from 'commander';
import inquirer from 'inquirer';
import tildify from 'tildify';

import { clone } from './template';
import { detectManager, exec, rmIfExists } from './utils';

const localCommand = '@contentful/create-contentful-app';
const mainCommand = `npx ${localCommand}`;

function successMessage(folder: string) {
  console.log(`
${chalk.cyan('Success!')} Created a new Contentful app in ${chalk.bold(tildify(folder))}.

We suggest that you begin by running:

    ${chalk.cyan(`cd ${folder}`)}
    ${chalk.cyan(`${mainCommand} create-definition`)}
  `);
}

function updatePackageName(appFolder: string) {
  const packageJsonPath = resolve(appFolder, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, { encoding: 'utf-8' }));
  packageJson.name = basename(appFolder);
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + EOL);
}

async function promptAppName() {
  return await inquirer.prompt([
    {
      name: 'name',
      message: 'App name',
      default: 'contentful-app'
    }
  ]);
}

type CLIOptions = Partial<{
  npm: boolean;
  yarn: boolean;
  Js: boolean;
  Ts: boolean;
}>

async function initProject(appName: string, options: CLIOptions) {
  try {
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
    await clone(templateType, fullAppFolder);

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
    .command('init', { isDefault: true })
    .description('Bootstrap your app inside a new folder ‘app-name’')
    .argument('[app-name]', 'App name')
    .option('--npm', 'Use NPM')
    .option('--yarn', 'Use Yarn')
    .option('--javascript, -js')
    .option('--typescript, -ts')
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
