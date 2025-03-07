import chalk from 'chalk';
import {
  AppLocation,
  FieldType,
  ParameterDefinition,
  InstallationParameterType,
} from 'contentful-management';
import inquirer from 'inquirer';
import path from 'node:path';
import { DEFAULT_CONTENTFUL_API_HOST } from '../constants';
import { buildAppParameterSettings } from './build-app-parameter-settings';

export interface AppDefinitionSettings {
  name: string;
  locations: AppLocation['location'][];
  fields?: FieldType[];
  pageNav?: boolean;
  pageNavLinkName?: string;
  pageNavLinkPath?: string;
  host?: string;
  buildAppParameters: boolean;
  parameters?: {
    instance: ParameterDefinition[];
    installation: ParameterDefinition<InstallationParameterType>[];
  };
}

export async function buildAppDefinitionSettings() {
  console.log(
    chalk.dim(`
NOTE: This will create an app definition in your Contentful organization.
      - Read more about app definitions: ${chalk.underline('https://ctfl.io/app-definitions')}
      - Read more about app locations: ${chalk.underline('https://ctfl.io/app-locations')}
  `)
  );

  const appDefinitionSettings = await inquirer.prompt<AppDefinitionSettings>([
    {
      name: 'name',
      message: `App name (${path.basename(process.cwd())}):`,
    },
    {
      name: 'locations',
      message: `Select where your app can be rendered:`,
      type: 'checkbox',
      choices: [
        { name: 'App configuration screen ', value: 'app-config' },
        { name: 'Entry field', value: 'entry-field' },
        { name: 'Entry sidebar', value: 'entry-sidebar' },
        { name: 'Entry editor', value: 'entry-editor' },
        { name: 'Page', value: 'page' },
        { name: 'Home', value: 'home' },
      ],
    },
    {
      name: 'fields',
      message: 'Select the field types the app can be rendered:',
      type: 'checkbox',
      choices: [
        { name: 'Short text', value: { type: 'Symbol' } },
        { name: 'Short text, list', value: { type: 'Array', items: { type: 'Symbol' } } },
        { name: 'Long text', value: { type: 'Text' } },
        { name: 'Rich text', value: { type: 'RichText' } },
        { name: 'Number, integer', value: { type: 'Integer' } },
        { name: 'Number, decimal', value: { type: 'Number' } },
        { name: 'Date and time', value: { type: 'Date' } },
        { name: 'Location', value: { type: 'Location' } },
        { name: 'Boolean', value: { type: 'Boolean' } },
        { name: 'JSON object', value: { type: 'Object' } },
        { name: 'Entry reference', value: { type: 'Link', linkType: 'Entry' } },
        {
          name: 'Entry reference, list',
          value: {
            type: 'Array',
            items: {
              type: 'Link',
              linkType: 'Entry',
            },
          },
        },
        { name: 'Media reference', value: { type: 'Link', linkType: 'Asset' } },
        {
          name: 'Media reference, list',
          value: { type: 'Array', items: { type: 'Link', linkType: 'Asset' } },
        },
      ],
      when(answers) {
        return answers.locations.includes('entry-field');
      },
      validate(input) {
        if (input.length < 1) {
          return 'You must choose at least one field type.';
        }
        return true;
      },
    },
    {
      name: 'pageNav',
      message: 'Page location: Would you like your page location to render in the main navigation?',
      type: 'confirm',
      default: false,
      when(answers) {
        return answers.locations.includes('page');
      },
    },
    {
      name: 'pageNavLinkName',
      message: 'Page location: Provide a name for the link in the main navigation:',
      when(answers) {
        return answers.locations.includes('page') && answers.pageNav;
      },
      validate(input) {
        if (input.length < 1 || input.length > 40) {
          return 'Size must be at least 1 and at most 40';
        }
        return true;
      },
    },
    {
      name: 'pageNavLinkPath',
      message:
        'Page location: Provide a path which starts with / and does not contain empty space:',
      default: '/',
      when(answers) {
        return answers.locations.includes('page') && answers.pageNav;
      },
      validate(input) {
        if (input.length > 512) {
          return 'Maximum 512 characters';
        }
        if (input.includes(' ')) {
          return 'Path cannot contain empty space';
        }
        if (!input.startsWith('/')) {
          return 'Path must start with /';
        }
        return true;
      },
    },
    {
      name: 'host',
      message: `Contentful CMA endpoint URL:`,
      default: DEFAULT_CONTENTFUL_API_HOST,
    },
    {
      name: 'buildAppParameters',
      message:
        'Would you like to specify App Parameter schemas? (see https://ctfl.io/app-parameters)',
      type: 'confirm',
      default: false,
    },
  ]);

  if (appDefinitionSettings.buildAppParameters) {
    appDefinitionSettings.parameters = await buildAppParameterSettings();
  }

  appDefinitionSettings.locations = ['dialog', ...appDefinitionSettings.locations];

  return appDefinitionSettings;
}
