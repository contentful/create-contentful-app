import open from 'open';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { APP_DEF_ENV_KEY, DEFAULT_CONTENTFUL_API_HOST } from '../constants';
import { InstallOptions } from '../types';
import { getWebAppHostname } from '../utils';

export async function installToEnvironment(options: InstallOptions) {
  let definitionId;
  const prompts = [];

  if (options.definitionId) {
    definitionId = options.definitionId;
  } else if (process.env[APP_DEF_ENV_KEY]) {
    definitionId = process.env[APP_DEF_ENV_KEY];
  } else {
    prompts.push({
      name: 'definitionId',
      message: `The id of the app:`,
    });
  }

  if (!options.host) {
    prompts.push({
      name: 'host',
      message: `Contentful CMA endpoint URL:`,
      default: DEFAULT_CONTENTFUL_API_HOST,
    });
  }

  const openSettingsOptions = await inquirer.prompt(prompts);
  const hostValue = options.host || openSettingsOptions?.host;
  const appDefinitionIdValue = definitionId || openSettingsOptions?.definitionId;

  if (!appDefinitionIdValue) {
    console.log(`
        ${chalk.red('Error:')} There was no app-definition defined.

        Please add it with ${chalk.cyan('--definition-id=<app-definition-id>')}
        or set the environment variable ${chalk.cyan(`${APP_DEF_ENV_KEY} = <app-definition-id>`)}
      `);
    throw new Error('No app-definition-id');
  }

  const webApp = getWebAppHostname(hostValue);
  const redirectUrl = `https://${webApp}/deeplink?link=apps`;

  try {
    open(`${redirectUrl}&id=${definitionId}`);
  } catch (err: any) {
    console.log(`${chalk.red('Error:')} Failed to open browser`);
    console.log(err.message);
    throw err;
  }
}
