import inquirer from 'inquirer';
import chalk from 'chalk';
import { CLIOptions, ContentfulExample, InvalidTemplateError } from './types';
import { code, highlight, warn, wrapInBlanks } from './logger';
import { CURRENT_VERSION, examples_path, templates_path } from './constants';
import { isContentfulTemplate } from './utils';
import { getGithubFolderNames } from './getGithubFolderNames';

async function promptExampleSelection(version: string): Promise<string> {
  let fileName = 'typescript';

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
    const availableTemplates = await getGithubFolderNames(version, false);
     // filter out the the function templates
    const filteredTemplates = availableTemplates.filter(
      (template) => !template.includes('function-')
    );
    const { language } = await inquirer.prompt([
      {
        name: 'language',
        message: 'Pick a template',
        type: 'list',
        choices: filteredTemplates,
        default: 'typescript',
      },
    ]);
    fileName = language;
  } else {
    // get available templates from examples
    const availableExamples = await getGithubFolderNames(version);
    // filter out the function examples
    const filteredExamples = availableExamples.filter(
      (example) => !example.includes('function')
    );

    // ask user to select from the available examples
    const { example } = await inquirer.prompt([
      {
        name: 'example',
        message: 'Select an example:',
        type: 'list',
        choices: filteredExamples,
      },
    ]);

    fileName = example;
  }

  // return the selected template
  return selectPath(fileName, starter == "example", version);
}

function selectPath(template: string, isExample : boolean, version: string): string {
  wrapInBlanks(highlight(`---- Cloning the ${chalk.cyan(template)} template...`));
  return isExample ? examples_path(version) + template : templates_path(version) + template;
}

export async function generateSource(options: CLIOptions): Promise<string> {
  if (!options.version) {
    options.version = CURRENT_VERSION;
  }
  if (options.example) {
    // check to see if the example is valid
    const availableTemplates = await getGithubFolderNames(options.version);
    const isValidContentfulExample = availableTemplates.includes(options.example);
    if (!isValidContentfulExample) {
      throw new InvalidTemplateError(
        `${chalk.red(`Invalid template:`)} The example name ${highlight(
          chalk.cyan(options.example)
        )} is not valid. Please use one of Contentful's public example apps from ${highlight(
          `https://github.com/contentful/apps/tree/master/examples`
        )}. Use the ${code(`--example`)} option followed by the example name.`
      );
    }

    const templateSource = selectPath(options.example, true, options.version);
    return templateSource;
  }

  if (options.javascript) {
    return selectPath(ContentfulExample.Javascript, false, options.version);
  }

  if (options.typescript) {
    return selectPath(ContentfulExample.Typescript, false, options.version);
  }

  if (options.function || options.action) {
    return selectPath(ContentfulExample.Typescript, false, options.version);
  }

  return await promptExampleSelection(options.version);
}

export async function getPathSource(options: CLIOptions): Promise<string> {
  const source = options.source ?? (await generateSource(options));

  if (options.source && !isContentfulTemplate(source)) {
    warn(`Template at ${highlight(source)} is not an official Contentful app template!`);
  }

  return source;
}
