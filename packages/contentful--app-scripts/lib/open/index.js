const open = require('open');
const chalk = require('chalk');
const { APP_DEF_ENV_KEY } = require('../../utils/constants');

const REDIRECT_URL = 'https://app.contentful.com/deeplink?link=app-definition';

module.exports = {
  async run(options) {
    let definitionId;
    if (options.definitionId) {
      definitionId = options.definitionId;
    } else if (process.env[APP_DEF_ENV_KEY]) {
      definitionId = process.env[APP_DEF_ENV_KEY];
    } else {
      console.log(`
        ${chalk.red('Error:')} There was no app-definition defined.

        Please add it with ${chalk.cyan('--definition-id=<app-definition-id>')}
        or set the environment variable ${chalk.cyan(`${APP_DEF_ENV_KEY} = <app-definition-id>`)}
      `);
      throw new Error('No app-definition-id');
    }

    open(`${REDIRECT_URL}&id=${definitionId}`);
  },
};
