import inquirer from 'inquirer';
import path from 'path';
import { getGithubFolderNames } from './get-github-folder-names';
import { ACCEPTED_LANGUAGES, BANNED_FUNCTION_NAMES } from './constants';
import { GenerateFunctionSettings, Language } from '../types';
import ora from 'ora';
import chalk from 'chalk';
import { warn } from './logger';
import { ValidationError } from './types';

export async function buildGenerateFunctionSettingsInteractive() : Promise<GenerateFunctionSettings> {
  const baseSettings = await inquirer.prompt<GenerateFunctionSettings>([
    {
      name: 'name',
      message: `Function name (${path.basename(process.cwd())}):`,
    },
  ]);

  validateFunctionName(baseSettings);

  const filteredSources = await getGithubFolderNames();

  const sourceSpecificSettings = await inquirer.prompt<GenerateFunctionSettings>([
      {
          name: 'example',
          message: 'Select an example:',
          type: 'list',
          choices: filteredSources,
      },
      {
          name: 'language',
          message: 'Select a language',
          type: 'list',
          choices: [
              { name: 'TypeScript', value: 'typescript' },
              { name: 'JavaScript', value: 'javascript' },
          ],
          default: 'typescript',
      }
  ])
  baseSettings.example = sourceSpecificSettings.example
  baseSettings.language = sourceSpecificSettings.language
  return baseSettings
}

function validateFunctionName(baseSettings: GenerateFunctionSettings) {
  if (BANNED_FUNCTION_NAMES.includes(baseSettings.name)) {
    throw new ValidationError(chalk.red(`Invalid function name: ${baseSettings.name} is not allowed.`));
  } else if (!(/^[a-z0-9]+$/i.test(baseSettings.name))) {
      throw new ValidationError(chalk.red(`Invalid function name: ${baseSettings.name}. Note that function names must be alphanumeric.`));
  }
}

export function validateArguments(options: GenerateFunctionSettings) {
  const requiredParams = ['name', 'example', 'language'];
  if (!requiredParams.every((key) => key in options)) {
     throw new ValidationError(chalk.red('You must specify a function name, an example, and a language'));
  } 
  validateFunctionName(options);

   // Check if the language is valid
  if (!ACCEPTED_LANGUAGES.includes(options.language)) {
    warn(`Invalid language: ${options.language}. Defaulting to TypeScript.`);
    options.language = 'typescript';
  }

  // Convert options to lowercase and trim whitespace
  for (const key in options) {
    const optionKey = key as keyof GenerateFunctionSettings;
    const value = options[optionKey].toLowerCase().trim();
    
    if (optionKey === 'language') {
      options[optionKey] = value as Language;
    } else if (optionKey === 'example') {
      options[optionKey] = value;
    } else { // don't want to lowercase function names
      options[optionKey] = options[optionKey].trim();
    }
  }
}

export async function buildGenerateFunctionSettingsCLI(options: GenerateFunctionSettings) : Promise<GenerateFunctionSettings> {
  const validateSpinner = ora('Validating your input\n').start();
  const settings: GenerateFunctionSettings = {} as GenerateFunctionSettings;
    try {
      validateArguments(options);
        
      // Check if the source exists
      const filteredSources = await getGithubFolderNames();
      if (!filteredSources.includes(options.example)) {
        throw new ValidationError(`Invalid example name: ${options.example}. Please choose from: ${filteredSources.join(', ')}`);
      }
      settings.language = options.language;
      settings.example = options.example;
      settings.name = options.name;
      return settings;
    } catch (err: any) {
      console.log(`
        ${chalk.red('Validation failed')}
      `);
      // eslint-disable-next-line no-process-exit
      throw err;
    } finally {
      validateSpinner.stop();
    }
}