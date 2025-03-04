import inquirer from 'inquirer';
import path from 'path';
import { getGithubFolderNames } from './get-github-folder-names';
import { ACCEPTED_LANGUAGES, BANNED_FUNCTION_NAMES } from './constants';
import { GenerateFunctionSettings, Language } from '../types';
import ora from 'ora';
import chalk from 'chalk';
import { warn } from './logger';

export async function buildGenerateFunctionSettings() : Promise<GenerateFunctionSettings> {
  const baseSettings = await inquirer.prompt<GenerateFunctionSettings>([
    {
      name: 'name',
      message: `Function name (${path.basename(process.cwd())}):`,
    },
  ]);
  if (BANNED_FUNCTION_NAMES.includes(baseSettings.name)) {
    throw new Error(`Invalid function name: ${baseSettings.name}`);
  }
  const filteredSources = await getGithubFolderNames();

  const sourceSpecificSettings = await inquirer.prompt<GenerateFunctionSettings>([
      {
          name: 'source',
          message: 'Select a template:',
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
  baseSettings.source = sourceSpecificSettings.source
  baseSettings.language = sourceSpecificSettings.language
  return baseSettings
}

function validateArguments(options: GenerateFunctionSettings) {
  const requiredParams = ['name', 'source', 'language'];
  if (!requiredParams.every((key) => key in options)) {
      throw new Error('You must specify a function name, a source, and a language');
  } 
   if (BANNED_FUNCTION_NAMES.includes(options.name)) {
    throw new Error(`Invalid function name: ${options.name}`);
  }
  // Convert options to lowercase and trim whitespace
  for (const key in options) {
    const optionKey = key as keyof GenerateFunctionSettings;
    const value = options[optionKey].toLowerCase().trim();
    
    if (optionKey === 'language') {
      // Assert that the value is of type Language
      options[optionKey] = value as Language;
    } else {
      options[optionKey] = value;
    }
  }
}

export async function buildGenerateFunctionSettingsFromOptions(options: GenerateFunctionSettings) : Promise<GenerateFunctionSettings> {
  const validateSpinner = ora('Validating your input\n').start();
  const settings: GenerateFunctionSettings = {} as GenerateFunctionSettings;
    try {
      validateArguments(options);
        
      // Check if the source exists
      const filteredSources = await getGithubFolderNames();
      if (!filteredSources.includes(options.source)) {
        throw new Error(`Invalid source name: ${options.source}. Please choose from: ${filteredSources.join(', ')}`);
      }
      
      // Check if the language is valid
      if (!ACCEPTED_LANGUAGES.includes(options.language)) {
        warn(`Invalid language: ${options.language}. Defaulting to TypeScript.`);
        settings.language = 'typescript';
      } else {
        settings.language = options.language;
      }

      settings.source = options.source;
      settings.name = options.name;
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