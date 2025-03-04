import inquirer from 'inquirer';
import path from 'path';
import { getGithubFolderNames, checkIfFolderHasLanguageOptions } from './get-github-folder-names';
import { BANNED_FUNCTION_NAMES, CURRENT_VERSION, LEGACY_VERSION, NEXT_VERSION } from './constants';
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
  } else { // sourceType === 'example'
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

    const languageOptions = await checkIfFolderHasLanguageOptions(CURRENT_VERSION, exampleSettings.sourceName);
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
  const exampleRequired = ['name', 'example'];

  // Ensure function name is not invalid
  if (BANNED_FUNCTION_NAMES.includes(options.name)) {
    throw new Error(`Invalid function name: ${options.name}`);
  }

  // ensure required arguments are all present
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

  // Ensure all string values are trimmed and lowercased
  for (const key of Object.keys(options)) {
    const value = options[key as keyof GenerateFunctionOptions];
    if (typeof value === 'string') {
      (options as any)[key] = value.toLowerCase().trim();
    }
  }
}

export async function buildGenerateFunctionSettingsFromOptions(options: GenerateFunctionOptions) : Promise<GenerateFunctionSettings> {
  const validateSpinner = ora('Validating your input\n').start();
  const settings: GenerateFunctionSettings = {} as GenerateFunctionSettings;
    try {
      validateArguments(options);

      if ('example' in options) {
        if ('template' in options) {
          throw new Error('Cannot specify both --template and --example');
        }

        // Validate example name
        const filteredExamples = await getGithubFolderNames(options.version as string, true);
        if (!filteredExamples.includes(options.example as AcceptedFunctionExamples)) {
          throw new Error(`Invalid example name: ${options.example}. Please choose from: ${filteredExamples.join(', ')}`);
        }

        // Validate language option is present when it is needed
        const languageOptions = await checkIfFolderHasLanguageOptions(options.version as string, options.example);
        if (languageOptions.length > 1) {
          if (!('language' in options)) {
            throw new Error(`You must specify a language for the example ${options.example}. Available languages: ${languageOptions.join(', ')}`);
          }
        }
        // Validate language option is valid
        if (options.language && !languageOptions.includes(options.language)) {
          warn(`Invalid language: ${options.language}. Defaulting to ${languageOptions[0]}`);
          settings.language = languageOptions[0] as Language;
        } else {
          settings.language = options.language as Language;
        }

        // Set other settings values
        settings.sourceType = 'example';
        settings.sourceName = options.example;
        settings.name = options.name;

      } else if ('template' in options) {
        if ('language' in options && options.language && options.language != options.template) {
          console.warn(`Ignoring language option: ${options.language}. Defaulting to ${options.template}.`);
        }

        // Validate template name
        const templateOptions = await getGithubFolderNames(options.version as string, false);
        if (templateOptions.length === 0) {
          throw new Error(`No options found for template ${options.template}`);
        }

        // Validate template option is valid
        if (!templateOptions.includes(options.template as Language)) {
          throw new Error(`Invalid template name: ${options.template}. Please choose from: ${templateOptions.join(', ')}`);
        } else {
          settings.language = options.template as Language;
          settings.sourceName = options.template;
        }

        // Set other settings values
        settings.sourceType = 'template';
        settings.name = options.name;
      }

      
      if ('version' in options) { // version will always be in options due to validateArguments()
        settings.version = options.version;
      }

      validateSpinner.succeed('Input validated');
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