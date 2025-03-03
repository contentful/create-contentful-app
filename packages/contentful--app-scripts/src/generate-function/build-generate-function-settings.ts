import inquirer from 'inquirer';
import path from 'path';
import { checkIfExampleFolderHasLanguageOptions, getGithubFolderNames } from './get-github-folder-names';
import { ACCEPTED_EXAMPLE_FOLDERS, ACCEPTED_LANGUAGES, ALL_VERSIONS, BANNED_FUNCTION_NAMES, CURRENT_VERSION, LEGACY_VERSION, NEXT_VERSION } from './constants';
import { GenerateFunctionSettings, AcceptedFunctionExamples, GenerateFunctionOptions, Language } from '../types';
import ora from 'ora';
import chalk from 'chalk';
import { warn } from './logger';

export async function buildGenerateFunctionSettings(): Promise<GenerateFunctionSettings> {
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
    },
  ]);

  if (BANNED_FUNCTION_NAMES.includes(baseSettings.name)) {
    throw new Error(`Invalid function name: ${baseSettings.name}`);
  }

  let sourceSpecificSettings: Partial<GenerateFunctionSettings> = {};

  if (baseSettings.sourceType === 'template') {
    const filteredExamples = await getGithubFolderNames(CURRENT_VERSION, false);
    const templateSettings = await inquirer.prompt<Pick<GenerateFunctionSettings, 'language'>>([
      {
        name: 'language',
        message: 'Pick a template',
        type: 'list',
        choices: filteredExamples,
      },
    ]);
    sourceSpecificSettings = {
      ...sourceSpecificSettings,
      ...templateSettings,
      sourceName: templateSettings.language.toLowerCase(),
    };
  } else {
    const filteredExamples = await getGithubFolderNames(CURRENT_VERSION, true);
    const exampleSettings = await inquirer.prompt<Pick<GenerateFunctionSettings, 'sourceName'>>([
      {
        name: 'sourceName',
        message: 'Select an example:',
        type: 'list',
        choices: filteredExamples,
      },
    ]);
    sourceSpecificSettings = {
      ...sourceSpecificSettings,
      ...exampleSettings,
    };

    const languageOptions = await checkIfExampleFolderHasLanguageOptions(CURRENT_VERSION, exampleSettings.sourceName);
    if (languageOptions.length > 1) {
      const languagePrompt = await inquirer.prompt<Pick<GenerateFunctionSettings, 'language'>>([
        {
          name: 'language',
          message: 'Pick a language',
          type: 'list',
          choices: languageOptions,
        },
      ]);
      sourceSpecificSettings = {
        ...sourceSpecificSettings,
        ...languagePrompt,
      };
    }
  }

  const finalSettings: GenerateFunctionSettings = {
    ...baseSettings,
    ...sourceSpecificSettings,
    version: CURRENT_VERSION,
  };

  return finalSettings;
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
  // Validate version
  if ('legacy' in options) {
    options.version = LEGACY_VERSION
  } else if ('next' in options) {
    options.version = NEXT_VERSION
  } else { 
      options.version = CURRENT_VERSION
  }

  for (const key of Object.keys(options)) {
    const value = options[key as keyof GenerateFunctionOptions];
    // Only if the value is a string, we do .toLowerCase().trim()
    if (typeof value === 'string') {
      // We can safely cast to string now:
      (options as any)[key] = value.toLowerCase().trim();
    }
  }
}

export async function buildGenerateFunctionSettingsFromOptions(options: GenerateFunctionOptions) : Promise<GenerateFunctionSettings> {
  const validateSpinner = ora('Validating your input\n').start();
  const settings: GenerateFunctionSettings = {} as GenerateFunctionSettings;
    try {
      validateArguments(options);
      console.debug('options', options);

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

      if ('version' in options) {
        settings.version = options.version;
      } else {
        settings.version = CURRENT_VERSION
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