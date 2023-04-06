import fetch from 'node-fetch';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { CLIOptions, ContentfulExample } from './types';
import { highlight, warn, wrapInBlanks } from './logger';
import { EXAMPLES_PATH, TEMPLATES } from './constants';
import { isContentfulTemplate } from './utils';

const CONTENTFUL_APPS_EXAMPLE_FOLDER =
  'https://api.github.com/repos/contentful/apps/contents/examples';

async function getGithubFolderNames() {
  const response = await fetch(CONTENTFUL_APPS_EXAMPLE_FOLDER);
  const contents = await response.json();

  return contents
    .filter((content: any) => content.type === 'dir' && !TEMPLATES.includes(content.name))
    .map((content: any) => content.name);
}

async function promptExampleSelection(): Promise<string> {
  let template = 'typescript';

  // ask user whether to start with a blank template or use an example
  const { starter } = await inquirer.prompt([
    {
      name: 'starter',
      message: 'Do you want to start with a blank template or use one of our examples?',
      type: 'list',
      choices: [
        { name: 'Template', value: 'template' },
        { name: 'Example', value: 'example' },
      ],
      default: 'template',
    },
  ]);

  // if the user chose to use a template, ask which language they prefer
  if (starter === 'template') {
    const { language } = await inquirer.prompt([
      {
        name: 'language',
        message: 'Pick a template',
        type: 'list',
        choices: [
          { name: 'TypeScript', value: 'typescript' },
          { name: 'JavaScript', value: 'javascript' },
          { name: 'Next.js', value: 'nextjs' },
          { name: 'React + Vite', value: 'vite-react' },
          { name: 'Vue', value: 'vue' },
        ],
        default: 'typescript',
      },
    ]);
    template = language;
  } else {
    // get available templates from examples
    const availableTemplates = await getGithubFolderNames();

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

export async function getTemplateSource(options: CLIOptions): Promise<string> {
  const source = options.source ?? (await makeContentfulExampleSource(options));

  if (options.source && !isContentfulTemplate(source)) {
    warn(`Template at ${highlight(source)} is not an official Contentful app template!`);
  }

  return source;
}
