import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import degit from 'degit';
import rimraf from 'rimraf';

import { CLIOptions, ContentfulExample } from './types';
import { highlight, success, warn, wrapInBlanks } from './logger';
import { rmIfExists } from './utils';
import fetch from 'node-fetch';
import inquirer from 'inquirer';
import chalk from 'chalk';

const EXAMPLES_PATH = 'contentful/apps/examples/';

function isContentfulTemplate(url: string) {
  return Object.values(ContentfulExample).some((t) => url.includes(EXAMPLES_PATH + t));
}

async function getGithubFolderNames(username: string, repo: string, path: string) {
  const url = `https://api.github.com/repos/${username}/${repo}/contents/${path}`;

  const response = await fetch(url);
  const contents: any = await response.json();

  return contents
    .filter((content: any) => content.type === 'dir')
    .map((content: any) => content.name);
}

async function promptExampleSelection(): Promise<string> {
  let template = 'typescript';

  // ask user whether to start with a blank template or use an example template
  const { starter } = await inquirer.prompt([
    {
      name: 'starter',
      message: 'Do you want to start with an example template or use one of the blank templates?',
      type: 'list',
      choices: ['blank', 'example'],
      default: 'blank',
    },
  ]);

  // if the user chose to use an blank template, ask which language they prefer
  if (starter === 'blank') {
    const { language } = await inquirer.prompt([
      {
        name: 'language',
        message: 'Do you prefer TypeScript or JavaScript',
        type: 'list',
        choices: [
          { name: 'TypeScript', value: 'typescript' },
          { name: 'JavaScript', value: 'javascript' },
        ],
        default: 'typescript',
      },
    ]);
    template = language;
  } else {
    // get available templates from examples
    const availableTemplates = await getGithubFolderNames('contentful', 'apps', 'examples');

    // ask user to select a template from the available examples
    const { example } = await inquirer.prompt([
      {
        name: 'example',
        message: 'Select a template',
        type: 'list',
        choices: availableTemplates,
      },
    ]);

    template = example;
  }

  // return the selected template
  return selectTemplate(template);
}

function selectTemplate(template: string) {
  wrapInBlanks(highlight(`---- Cloning the ${chalk.cyan(template)} template...`));
  return EXAMPLES_PATH + template;
}

async function makeContentfulExampleSource(options: CLIOptions): Promise<string> {
  if (options.example) {
    return selectTemplate(options.example);
  }

  if (options.javascript) {
    return selectTemplate(ContentfulExample.Javascript);
  }

  if (options.typescript) {
    return selectTemplate(ContentfulExample.Typescript);
  }

  return await promptExampleSelection();
}

async function getTemplateSource(options: CLIOptions) {
  const source = options.source ?? (await makeContentfulExampleSource(options));

  if (options.source && !isContentfulTemplate(source)) {
    warn(`Template at ${highlight(source)} is not an official Contentful app template!`);
  }

  return source;
}

async function clone(source: string, destination: string) {
  const d = degit(source, { mode: 'tar', cache: false });

  try {
    await d.clone(destination);
  } catch (e: any) {
    if (e.code === 'DEST_NOT_EMPTY') {
      // In this case, we know that degit will suggest users
      // provide a 'force' flag - this is a flag for degit though
      // and not CCA. So we swallow the details of this error
      // to avoid confusing people.
      throw new Error('Destination directory is not empty.');
    }
    throw e;
  }
}

function validate(destination: string): void {
  const packageJSONLocation = `${destination}/package.json`;
  if (!existsSync(packageJSONLocation)) {
    throw new Error(`Invalid template: missing "${packageJSONLocation}".`);
  }

  try {
    JSON.parse(readFileSync(packageJSONLocation, 'utf-8'));
  } catch (e) {
    throw new Error(`Invalid template: invalid "${packageJSONLocation}".`);
  }
}

function cleanUp(destination: string) {
  rmIfExists(resolve(destination, 'package-lock.json'));
  rmIfExists(resolve(destination, 'yarn.lock'));
}

export async function cloneTemplateIn(destination: string, options: CLIOptions) {
  const source = await getTemplateSource(options);

  await clone(source, destination);
  console.log(success('Done!'));

  try {
    validate(destination);
  } catch (e) {
    // cleanup in case of invalid example
    rimraf.sync(destination);
    throw e;
  }

  cleanUp(destination);
}
