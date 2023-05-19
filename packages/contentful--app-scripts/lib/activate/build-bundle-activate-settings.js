// @ts-check

const inquirer = require('inquirer');
const { getAppInfo } = require('../get-app-info');

async function buildBundleActivateSettings(options) {
  let { bundleId, host } = options;
  if (!bundleId) {
    const prompts = await inquirer.prompt([
      {
        name: 'bundleId',
        message: `The id of the bundle you want to activate (required):`,
        validate: (input) => input.length > 0,
      },
    ]);
    bundleId = prompts.bundleId;
  }

  const appInfo = await getAppInfo(options);

  // Add app-config & dialog automatically
  return {
    ...appInfo,
    bundleId,
    host,
  };
}

exports.buildBundleActivateSettings = buildBundleActivateSettings;
