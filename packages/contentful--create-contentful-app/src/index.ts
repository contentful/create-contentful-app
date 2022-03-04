#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { basename, resolve } from 'path';
import { EOL } from 'os';
import validateNPMPackageName from 'validate-npm-package-name';
import { program } from 'commander';
import inquirer from 'inquirer';
import tildify from 'tildify';

import { cloneTemplateIn } from './template';
import { detectManager, exec, normalizeOptions } from './utils';
import { CLIOptions } from './types';
import { code, error, highlight, success, warn } from './logger';

const DEFAULT_APP_NAME = 'contentful-app';

function successMessage(folder: string) {
  console.log(`
${success('Success!')} Created a new Contentful app in ${highlight(tildify(folder))}.

Now kick it off by running

    ${code(`cd ${folder}`)}
    ${code(`npm start`)}
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
      default: DEFAULT_APP_NAME,
    },
  ]);
}

/**
 * Validates the user input and ensures it can be used as app name. If no app name is provided, shows a prompt.
 *
 * @param appName App name entered by the user
 * @returns Valid app name
 */
async function validateAppName(appName: string): Promise<string> {
  if (appName === 'create-definition') {
    throw new Error(
      `The ${code('create-definition')} command has been removed from ${code(
        'create-contentful-app'
      )}.\nTo create a new app definition first run ${code(
        'npx create-contentful-app'
      )} and then ${code('npm run create-app-definition')} within the new folder.`
    );
  }

  if (appName === 'init') {
    warn(
      `The ${code('init')} command has been removed from ${code(
        'create-contentful-app'
      )}. You can now create new apps running ${code('npx create-contentful-app')} directly.`
    );
    appName = '';
  }

  if (!appName) {
    const prompt = await promptAppName();
    appName = prompt.name;
  }

  if (!validateNPMPackageName(appName).validForNewPackages) {
    throw new Error(
      `Cannot create an app named "${appName}". Please choose a different name for your app.`
    );
  }

  return appName;
}

async function initProject(appName: string, options: CLIOptions) {
  const normalizedOptions = normalizeOptions(options);

  try {
    appName = await validateAppName(appName);
    const fullAppFolder = resolve(process.cwd(), appName);

    console.log(`Creating a Contentful app in ${highlight(tildify(fullAppFolder))}.`);

    await cloneTemplateIn(fullAppFolder, normalizedOptions);

    updatePackageName(fullAppFolder);

    if (normalizedOptions.yarn || detectManager() === 'yarn') {
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
    .name(`npx ${code('create-contentful-app')}`)
    .helpOption(true)
    .description(
      [
        'Bootstrap your app inside a new folder `my-app`',
        '',
        code('  create-contentful-app my-app'),
        '',
        'or specify your own template',
        '',
        code('  create-contentful-app my-app --source "github:user/repo"'),
        '',
        `Official Contentful templates are hosted at ${highlight(
          'https://github.com/contentful/apps/tree/master/examples'
        )}.`,
      ].join('\n')
    )
    .argument('[app-name]', 'app name')
    .option('--npm', 'use npm')
    .option('--yarn', 'use Yarn')
    .option('--javascript, -js', 'use default JavaScript template')
    .option('--typescript, -ts', 'use default TypeScript template')
    .option(
      '-s, --source <url>',
      [
        `provide a template by its source repository.`,
        `format: URL (HTTPS or SSH) or ${code('vendor:user/repo')} (e.g., ${code(
          'github:user/repo'
        )})`,
      ].join('\n')
    )
    .option('-e, --example <example-name>', 'bootstrap an example app from https://github.com/contentful/apps/tree/master/examples')
    .action(initProject);
  await program.parseAsync();
})();
