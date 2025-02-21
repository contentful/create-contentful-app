import inquirer from 'inquirer';
import path from 'path';
import { getGithubFolderNames } from './getGithubFolderNames';
import { ACCEPTED_EXAMPLE_FOLDERS } from './constants';
import { AcceptedExamples } from './types';

export type SourceType = 'template' | 'example';
export type Language = 'javascript' | 'typescript';
export type SourceName = Language | AcceptedExamples

export interface GenerateFunctionSettings {
  name: string;
  sourceType: SourceType;
  sourceName: SourceName
  language: Language
}

export async function buildGenerateFunctionSettings() {
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
