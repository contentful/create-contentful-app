// @ts-check

const inquirer = require('inquirer');
const { getAppInfo } = require('../get-app-info');

async function buildBundleActivateSettings(options) {
  const { bundleId, host } = options;
  const prompts = [];

  if (!bundleId) {
    prompts.push({
      name: 'bundleId',
      message: `The id of the bundle you want to activate (required):`,
      validate: (input) => input.length > 0,
    });
  }
  if (!host) {
    prompts.push({
      name: 'host',
      message: `Contentful CMA endpoint URL:`,
      default: 'api.contentful.com',
    });
  }

  const appActivateSettings = await inquirer.prompt(prompts);
  const appInfo = await getAppInfo(options);

  // Add app-config & dialog automatically
  return {
    bundleId,
    host,
    ...appActivateSettings,
    ...appInfo,
  };
}

exports.buildBundleActivateSettings = buildBundleActivateSettings;
