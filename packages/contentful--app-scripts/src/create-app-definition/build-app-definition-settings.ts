import chalk from 'chalk';
import inquirer from 'inquirer';
import path from 'node:path';
import { DEFAULT_CONTENTFUL_API_HOST } from '../constants';
import { buildAppParameterSettings } from './build-app-parameter-settings';
import { AppDefinitionSettings } from '../types';
import { pageNavLinkNamePrompt, pageNavLinkPathPrompt, pageNavPrompt, selectFieldsPrompt, selectLocationsPrompt } from '../location-prompts';

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
    { ...selectLocationsPrompt },
    { ...selectFieldsPrompt },
    { ...pageNavPrompt },
    { ...pageNavLinkNamePrompt },
    { ...pageNavLinkPathPrompt },
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
