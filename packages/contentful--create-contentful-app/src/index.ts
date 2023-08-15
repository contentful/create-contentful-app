#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { basename, resolve } from 'path';
import { EOL } from 'os';
import validateNPMPackageName from 'validate-npm-package-name';
import { program } from 'commander';
import inquirer from 'inquirer';
import tildify from 'tildify';

import { cloneTemplateIn } from './template';
import { detectManager, exec, normalizeOptions, isContentfulTemplate } from './utils';
import { CLIOptions } from './types';
import { code, error, highlight, success, warn, wrapInBlanks } from './logger';
import chalk from 'chalk';
import { CREATE_APP_DEFINITION_GUIDE_URL, EXAMPLES_REPO_URL } from './constants';
import { getTemplateSource } from './getTemplateSource';
import { track } from './analytics';
import { cloneAppAction } from './includeAppAction';

const DEFAULT_APP_NAME = 'contentful-app';

function successMessage(folder: string, useYarn: boolean) {
  console.log(`
${success('Success!')} Created a new Contentful app in ${highlight(tildify(folder))}.`);

  wrapInBlanks(highlight('---- Next Steps'));

  console.log(`Now create an app definition for your app by running

    ${code(`cd ${tildify(folder)}`)}
    ${code(useYarn ? 'yarn create-app-definition' : 'npm run create-app-definition')}

    or you can create it manually in web app:
    ${highlight(CREATE_APP_DEFINITION_GUIDE_URL)}
  `);

  console.log(`Then kick it off by running

    ${code(`cd ${tildify(folder)}`)}
    ${code(`${useYarn ? 'yarn' : 'npm'} start`)}
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
        'create-contentful-app',
      )}.\nTo create a new app definition first run ${code(
        'npx create-contentful-app',
      )} and then ${code('npm run create-app-definition')} within the new folder.`,
    );
  }

  if (appName === 'init') {
    warn(
      `The ${code('init')} command has been removed from ${code(
        'create-contentful-app',
      )}. You can now create new apps running ${code('npx create-contentful-app')} directly.`,
    );
    appName = '';
  }

  if (!appName) {
    const prompt = await promptAppName();
    appName = prompt.name;
  }

  if (!validateNPMPackageName(appName).validForNewPackages) {
    throw new Error(
      `Cannot create an app named "${appName}". Please choose a different name for your app.`,
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

    const isInteractive =
      !normalizedOptions.example &&
      !normalizedOptions.source &&
      !normalizedOptions.javascript &&
      !normalizedOptions.typescript;

    const templateSource = await getTemplateSource(options);

    track({
      template: templateSource,
      manager: normalizedOptions.npm ? 'npm' : 'yarn',
      interactive: isInteractive,
    });

    await cloneTemplateIn(fullAppFolder, templateSource);

    if (!isInteractive && isContentfulTemplate(templateSource) && normalizedOptions.action) {
      await cloneAppAction(fullAppFolder, !!normalizedOptions.typescript);
    }

    updatePackageName(fullAppFolder);

    const useYarn = normalizedOptions.yarn || detectManager() === 'yarn';

    wrapInBlanks(
      highlight(
        `---- Installing the dependencies for your app (using ${chalk.cyan(
          useYarn ? 'yarn' : 'npm',
        )})...`,
      ),
    );
    if (useYarn) {
      await exec('yarn', [], { cwd: fullAppFolder });
    } else {
      await exec('npm', ['install', '--no-audit', '--no-fund'], { cwd: fullAppFolder });
    }
    successMessage(fullAppFolder, useYarn);
  } catch (err) {
    error(`Failed to create ${appName}`, err);
    process.exit(1);
  }
}

(async function main() {
  program
    .name(`npx ${code('create-contentful-app')}`)
    .helpOption(true, 'shows all available CLI options')
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
        `Official Contentful templates and examples are hosted at ${highlight(EXAMPLES_REPO_URL)}.`,
      ].join('\n'),
    )
    .argument('[app-name]', 'app name')
    .option('--npm', 'use npm')
    .option('--yarn', 'use Yarn')
    .option('-ts, --typescript', 'use TypeScript template (default)')
    .option('-js, --javascript', 'use JavaScript template')
    .option('-e, --example <example-name>', `bootstrap an example app from ${EXAMPLES_REPO_URL}`)
    .option(
      '-s, --source <url>',
      [
        `provide a template by its source repository.`,
        `format: URL (HTTPS or SSH) or ${code('vendor:user/repo')} (e.g., ${code(
          'github:user/repo',
        )})`,
      ].join('\n'),
    )
    .option('-a, --action', 'include a hosted app action in the ts or js template')
    .option(
      '-d, --delivery-function',
      'include a hosted delivery function template (EAP only, contact monet@contentful.com if interested)',
    )
    .action(initProject);
  await program.parseAsync();
})();
