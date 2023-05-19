// @ts-check

const inquirer = require('inquirer');
const { getAppInfo } = require('../get-app-info');
const { getActionsManifest } = require('../utils');

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

  const appUploadSettings = await inquirer.prompt(prompts);

  const appInfo = await getAppInfo(options);
  // Add app-config & dialog automatically
  return {
    bundleDirectory: bundleDir,
    skipActivation: !!skipActivation,
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
