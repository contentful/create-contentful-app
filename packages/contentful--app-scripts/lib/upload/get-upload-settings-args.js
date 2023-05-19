const chalk = require('chalk');
const ora = require('ora');
const { getAppInfo } = require('../get-app-info');
const { validateArguments } = require('../validate-arguments');
const { getActionsManifest } = require('../utils');

const requiredOptions = {
  definitionId: '--definition-id',
  organizationId: '--organization-id',
  bundleDir: '--bundle-dir',
  token: '--token',
};

async function getUploadSettingsArgs(options) {
  const validateSpinner = ora('Validating your input...').start();
  const actionsManifest = getActionsManifest();
  const { bundleDir, comment, skipActivation, host, userAgentApplication } = options;

  try {
    validateArguments(requiredOptions, options, 'upload');
    const appInfo = await getAppInfo(options);
    return {
      ...appInfo,
      bundleDirectory: bundleDir,
      skipActivation,
      comment,
      host,
      userAgentApplication,
      actions: actionsManifest,
    };
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
  getUploadSettingsArgs,
};
