import inquirer from 'inquirer';
import chalk from 'chalk';
import { CLIOptions, ContentfulExample, InvalidTemplateError } from './types';
import { code, highlight, warn, wrapInBlanks } from './logger';
import { ACCEPTED_EXAMPLE_FOLDERS, EXAMPLES_PATH } from './constants';
import { isContentfulTemplate } from './utils';
import { getGithubFolderNames } from './getGithubFolderNames';

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
        ],
        default: 'typescript',
      },
    ]);
    template = language;
  } else {
    // get available templates from examples
    const availableTemplates = await getGithubFolderNames();
    // filter out the ignored ones that are listed as templates instead of examples
    const filteredTemplates = availableTemplates.filter(
      (template) =>
        ACCEPTED_EXAMPLE_FOLDERS.includes(template as (typeof ACCEPTED_EXAMPLE_FOLDERS)[number])
    );
    console.log(availableTemplates.length, filteredTemplates.length);

    // ask user to select a template from the available examples
    const { example } = await inquirer.prompt([
      {
        name: 'example',
        message: 'Select an example:',
        type: 'list',
        choices: filteredTemplates,
      },
    ]);
    const { language } = await inquirer.prompt([
      {
        name: 'language',
        message: 'Pick a template',
        type: 'list',
        choices: [
          { name: 'TypeScript', value: 'typescript' },
          { name: 'JavaScript', value: 'javascript' },
        ],
        default: 'typescript',
      },
    ]);
    template = `${example}/${language}`;
  }

  // return the selected template
  return selectTemplate(template);
}

function selectTemplate(template: string) {
  wrapInBlanks(highlight(`---- Cloning the ${chalk.cyan(template)} template...`));
  return EXAMPLES_PATH + template;
}

export async function makeContentfulExampleSource(options: CLIOptions): Promise<string> {
  if (options.example) {
    // check to see if the example is valid
    const availableTemplates = await getGithubFolderNames();
    const isValidContentfulExample = availableTemplates.includes(options.example);
    if (!isValidContentfulExample) {
      throw new InvalidTemplateError(
        `${chalk.red(`Invalid template:`)} The example name ${highlight(
          chalk.cyan(options.example)
        )} is not valid. Please use one of Contentful's public example apps from ${highlight(
          `https://github.com/contentful/apps/tree/master/function-examples`
        )}. Use the ${code(`--example`)} option followed by the example name.`
      );
    }

    const templateSource = selectTemplate(options.example);
    return templateSource;
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
