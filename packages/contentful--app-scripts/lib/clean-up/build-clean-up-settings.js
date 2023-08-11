const inquirer = require('inquirer');
const { DEFAULT_BUNDLES_TO_KEEP, CONTENTFUL_API_HOST } = require('../../utils/constants');
const { getAppInfo } = require('../get-app-info');

async function buildCleanUpSettings(options) {
  const { keep, host } = options;
  const prompts = [];

  if (!keep) {
    prompts.push({
      type: 'number',
      name: 'keep',
      message: `The amount of newest bundles to keep:`,
      default: DEFAULT_BUNDLES_TO_KEEP,
    });
  }
  if (!host) {
    prompts.push({
      name: 'host',
      message: `Contentful CMA endpoint URL:`,
      default: CONTENTFUL_API_HOST,
    });
  }

  const appCleanUpSettings = await inquirer.prompt(prompts);
  const appInfo = await getAppInfo(options);

  return {
    keep: +keep,
    host,
    ...appCleanUpSettings,
    ...appInfo,
  };
}

module.exports = {
  buildCleanUpSettings,
};
