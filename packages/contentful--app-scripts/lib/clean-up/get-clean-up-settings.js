const chalk = require('chalk');
const ora = require('ora');
const { validateArguments } = require('../validate-arguments');
const { getAppInfo } = require('../get-app-info');

const requiredOptions = {
  definitionId: '--definition-id',
  organizationId: '--organization-id',
  token: '--token',
};

async function getCleanUpSettingsArgs(options) {
  const validateSpinner = ora('Validating your input...').start();

  try {
    validateArguments(requiredOptions, options, 'upload');
    return getAppInfo(options);
  } catch (err) {
    console.log(`
      ${chalk.red('Validation failed!')}
      ${err.message}
    `);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  } finally {
    validateSpinner.stop();
  }
}

module.exports = {
  getCleanUpSettingsArgs,
};
