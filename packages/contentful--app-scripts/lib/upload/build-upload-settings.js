// @ts-check

const inquirer = require('inquirer');
const { getAppInfo } = require('../get-app-info');
const { getActionsManifest } = require('../utils');
const { CONTENTFUL_API_HOST } = require('../../utils/constants');

async function buildAppUploadSettings(options) {
  const actionsManifest = getActionsManifest();
  const prompts = [];
  const { bundleDir, comment, skipActivation, host } = options;
  if (!bundleDir) {
    prompts.push({
      name: 'bundleDirectory',
      message: `Bundle directory, if not default:`,
      default: './build',
    });
  }
  if (!comment) {
    prompts.push({
      name: 'comment',
      message: `Add a comment to the created bundle:`,
      default: '',
    });
  }
  if (skipActivation === undefined) {
    prompts.push({
      type: 'confirm',
      name: 'activateBundle',
      message: `Do you want to activate the bundle after upload?`,
      default: true,
    });
  }
  if (!host) {
    prompts.push({
      name: 'host',
      message: `Contentful CMA endpoint URL:`,
      default: CONTENTFUL_API_HOST,
    });
  }

  const { activateBundle, ...appUploadSettings } = await inquirer.prompt(prompts);

  const appInfo = await getAppInfo(options);
  // Add app-config & dialog automatically
  return {
    bundleDirectory: bundleDir,
    skipActivation: skipActivation === undefined ? !activateBundle : skipActivation,
    comment,
    host,
    actions: actionsManifest,
    ...appUploadSettings,
    ...appInfo,
  };
}

module.exports = {
  buildAppUploadSettings,
};
