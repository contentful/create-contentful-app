const chalk = require('chalk');
const ora = require('ora');
const { getAppInfo } = require('../get-app-info');
const { validateArguments } = require('../validate-arguments');

const requiredOptions = {
  definitionId: '--definition-id',
  organizationId: '--organization-id',
  bundleId: '--bundle-id',
  token: '--token',
};

async function getActivateSettingsArgs(options) {
  const validateSpinner = ora('Validating your input').start();

  try {
    validateArguments(requiredOptions, options, 'activate');
    const appInfo = await getAppInfo(options);
    return {
      ...appInfo,
      bundleId: options.bundleId,
      comment: options.comment,
      host: options.host,
    };
  } catch (err) {
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

exports.getActivateSettingsArgs = getActivateSettingsArgs;
