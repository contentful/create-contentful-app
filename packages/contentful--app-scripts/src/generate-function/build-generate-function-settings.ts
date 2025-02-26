import inquirer from 'inquirer';
import path from 'path';
import { getGithubFolderNames } from './get-github-folder-names';
import { ACCEPTED_EXAMPLE_FOLDERS, ACCEPTED_LANGUAGES, BANNED_FUNCTION_NAMES } from './constants';
import { GenerateFunctionSettings, AcceptedFunctionExamples, SourceName, GenerateFunctionOptions, Language } from '../types';
import ora from 'ora';
import chalk from 'chalk';
import { warn } from './logger';

export async function buildGenerateFunctionSettings() : Promise<GenerateFunctionSettings> {
  const baseSettings = await inquirer.prompt<GenerateFunctionSettings>([
    {
      name: 'name',
      message: `Function name (${path.basename(process.cwd())}):`,
    },
    {
      name: 'sourceType',
      message: 'Do you want to start with a blank template or use one of our examples?',
      type: 'list',
      choices: [
        { name: 'Template', value: 'template' },
        { name: 'Example', value: 'example' },
      ],
      default: 'template',
    }
  ]);
  if (BANNED_FUNCTION_NAMES.includes(baseSettings.name)) {
    throw new Error(`Invalid function name: ${baseSettings.name}`);
  }
  let sourceSpecificSettings : GenerateFunctionSettings;
  if (baseSettings.sourceType === 'template') {
    sourceSpecificSettings = await inquirer.prompt<GenerateFunctionSettings>([
        {
            name: 'language',
            message: 'Pick a template',
            type: 'list',
            choices: [
                { name: 'TypeScript', value: 'typescript' },
                { name: 'JavaScript', value: 'javascript' },
            ],
            default: 'typescript',
        }
    ])
    sourceSpecificSettings.sourceName = sourceSpecificSettings.language.toLowerCase() as SourceName
  } else {
    const availableExamples = await getGithubFolderNames();
    const filteredExamples = availableExamples.filter(
      (template) =>
        ACCEPTED_EXAMPLE_FOLDERS.includes(template as (typeof ACCEPTED_EXAMPLE_FOLDERS)[number])
    );

    sourceSpecificSettings = await inquirer.prompt<GenerateFunctionSettings>([
        {
            name: 'sourceName',
            message: 'Select an example:',
            type: 'list',
            choices: filteredExamples,
        },
        {
            name: 'language',
            message: 'Pick a template',
            type: 'list',
            choices: [
                { name: 'TypeScript', value: 'typescript' },
                { name: 'JavaScript', value: 'javascript' },
            ],
            default: 'typescript',
        }
    ])
  }
    baseSettings.sourceName = sourceSpecificSettings.sourceName
    baseSettings.language = sourceSpecificSettings.language
    return baseSettings
}

function validateArguments(options: GenerateFunctionOptions) {
  const templateRequired = ['name', 'template'];
  const exampleRequired = ['name', 'example', 'language'];
  if (BANNED_FUNCTION_NAMES.includes(options.name)) {
    throw new Error(`Invalid function name: ${options.name}`);
  }
  if ('template' in options) {
    if (!templateRequired.every((key) => key in options)) {
      throw new Error('You must specify a function name and a template');
    }
  } else if ('example' in options) {
      if (!exampleRequired.every((key) => key in options)) {
        throw new Error('You must specify a function name, an example, and a language');
      } 
  } else {
    throw new Error('You must specify either --template or --example');
  }
}

export async function buildGenerateFunctionSettingsFromOptions(options: GenerateFunctionOptions) : Promise<GenerateFunctionSettings> {
  const validateSpinner = ora('Validating your input\n').start();
  const settings: GenerateFunctionSettings = {} as GenerateFunctionSettings;
    try {
      validateArguments(options);
      for (const key in options) { // convert all options to lowercase and trim
        const optionKey = key as keyof GenerateFunctionOptions;
        options[optionKey] = options[optionKey].toLowerCase().trim();
      }

      if ('example' in options) {
        if ('template' in options) {
          throw new Error('Cannot specify both --template and --example');
        }
        
        if (!ACCEPTED_EXAMPLE_FOLDERS.includes(options.example as AcceptedFunctionExamples)) {
          throw new Error(`Invalid example name: ${options.example}`);
        }
        
        if (!ACCEPTED_LANGUAGES.includes(options.language)) {
          warn(`Invalid language: ${options.language}. Defaulting to TypeScript.`);
          settings.language = 'typescript';
        } else {
          settings.language = options.language;
        }
        settings.sourceType = 'example';
        settings.sourceName = options.example;
        settings.name = options.name;

      } else if ('template' in options) {
        if ('language' in options && options.language && options.language != options.template) {
          console.warn(`Ignoring language option: ${options.language}. Defaulting to ${options.template}.`);
        }
        if (!ACCEPTED_LANGUAGES.includes(options.template as Language)) {
          console.warn(`Invalid language: ${options.template}. Defaulting to TypeScript.`);
          settings.language = 'typescript';
          settings.sourceName = 'typescript';
        } else {
          settings.language = options.template as Language;
          settings.sourceName = options.template;
        }
        settings.sourceType = 'template';
        settings.name = options.name;
      }

      return settings;
    } catch (err: any) {
      console.log(`
        ${chalk.red('Validation failed')}
        ${err.message}
      `);
      // eslint-disable-next-line no-process-exit
      process.exit(1);
    } finally {
      validateSpinner.stop();
    }
}