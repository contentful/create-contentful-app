import open from 'open';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { APP_DEF_ENV_KEY } from '../constants';
import { OpenSettingsOptions } from '../types';

export const REDIRECT_URL = 'https://app.contentful.com/deeplink?link=app-definition';

export async function openSettings(options: OpenSettingsOptions) {
  let definitionId;
  if (options.definitionId) {
    definitionId = options.definitionId;
  } else if (process.env[APP_DEF_ENV_KEY]) {
    definitionId = process.env[APP_DEF_ENV_KEY];
  } else {
    const prompts = await inquirer.prompt([
      {
        name: 'definitionId',
        message: `The id of the app:`,
      },
    ]);
    definitionId = prompts.definitionId;
  }

  if (!definitionId) {
    console.log(`
        ${chalk.red('Error:')} There was no app-definition defined.

        Please add it with ${chalk.cyan('--definition-id=<app-definition-id>')}
        or set the environment variable ${chalk.cyan(`${APP_DEF_ENV_KEY} = <app-definition-id>`)}
      `);
    throw new Error('No app-definition-id');
  }

  try {
    open(`${REDIRECT_URL}&id=${definitionId}`);
  } catch (err: any) {
    console.log(`${chalk.red('Error:')} Failed to open browser`);
    console.log(err.message);
    throw err;
  }
}
