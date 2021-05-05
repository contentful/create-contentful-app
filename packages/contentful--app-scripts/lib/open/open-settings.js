const open = require('open');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { APP_DEF_ENV_KEY } = require('../../utils/constants');

const REDIRECT_URL = 'https://app.contentful.com/deeplink?link=app-definition';

async function openSettings(options) {
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

  console.log(definitionId, 'DEFID');
  console.log(options, 'options');
  console.log(process.env[APP_DEF_ENV_KEY], 'process.env[APP_DEF_ENV_KEY]');

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
  } catch (err) {
    console.log(`${chalk.red('Error:')} Failed to open browser`);
    console.log(err.message);
    throw err;
  }
}

module.exports = {
  openSettings,
  REDIRECT_URL,
};
