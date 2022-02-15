#!/usr/bin/env node

import { createAppDefinition } from '@contentful/app-scripts';
import { readFileSync, writeFileSync } from 'fs';
import { basename, resolve } from 'path';
import { EOL } from 'os';
import validateAppName from 'validate-npm-package-name';
import { program } from 'commander';
import inquirer from 'inquirer';
import tildify from 'tildify';

import { cloneTemplateIn } from './template';
import { detectManager, exec } from './utils';
import { CLIOptions } from './types';
import { choice, code, error, highlight, success, warn } from './logger';

const localCommand = '@contentful/create-contentful-app';
const mainCommand = `npx ${localCommand}`;

function successMessage(folder: string) {
  console.log(`
${success('Success!')} Created a new Contentful app in ${highlight(tildify(folder))}.

We suggest that you begin by running:

    ${success(`cd ${folder}`)}
    ${success(`${mainCommand} create-definition`)}
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

    console.log(`Creating a Contentful app in ${highlight(tildify(fullAppFolder))}.`);

    if (options.npm && options.yarn) {
      warn(`Provided both ${highlight('--yarn')} and ${highlight(
        '--npm'
      )} flags, using ${choice('--npm')}.`);
    }

    if (options.Js && options.Ts) {
      warn(`Provided both ${highlight('--javascript')} and ${highlight(
        '--typescript'
      )} flags, using ${choice('--typescript')}.`);
    }

    await cloneTemplateIn(fullAppFolder, options);

    updatePackageName(fullAppFolder);

    const useYarn = (options.yarn || detectManager() === 'yarn') && !options.npm;

    if (useYarn) {
      await exec('yarn', [], { cwd: fullAppFolder });
    } else {
      await exec('npm', ['install'], { cwd: fullAppFolder });
    }

    successMessage(fullAppFolder);
  } catch (err) {
    error(`Failed to create ${appName}`, String(err));
    process.exit(1);
  }
}

(async function main() {
  program
    .command('init', { isDefault: true })
    .description([
      'Bootstrap your app inside a new folder ‘my-app’',
      '',
      code('  create-contentful-app init my-app'),
      '',
      'or you can specify your own template',
      '',
      code('  create-contentful-app init my-app --templateSource "github:user/repo"'),
      '',
      `Contentful official templates are hosted at ${highlight('https://github.com/contentful/apps/tree/master/templates')}.`
    ].join('\n'))
    .argument('[app-name]', 'Name of the app')
    .option('--npm', 'Use NPM')
    .option('--yarn', 'Use Yarn')
    .option('--javascript, -js', 'Use default Javascript template')
    .option('--typescript, -ts', 'Use default Typescript template')
    .option('-t, --templateSource <url>', [
      `Provide a template by its source repository`,
      `Format: URL (HTTPS and SSH) and ${code('vendor:user/repo')} (e.g., ${code('github:user/repo')})`
    ].join('\n'))
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
    .name(success('@contentful/create-contentful-app'))
    .usage(success('[options] {[app-name]|[command]}'))
    .helpOption(false);

  await program.parseAsync();
})();
