// @ts-check

const inquirer = require('inquirer');
const { getAppInfo } = require('../get-app-info');
const { showAppManifestFound, getActionsManifest } = require('../utils');

async function buildAppUploadSettings(options) {
  const actionsManifest = getActionsManifest();
  const prompts = [];
  if (!options.bundleDir) {
    prompts.push({
      name: 'bundleDirectory',
      message: `Bundle directory, if not default:`,
      default: './build',
    });
  }
  if (!options.comment) {
    prompts.push({
      name: 'comment',
      message: `Add a comment to the created bundle:`,
      default: '',
    });
  }

  const appUploadSettings = await inquirer.prompt(prompts);

  if (actionsManifest) {
    showAppManifestFound();
  }

  const appInfo = await getAppInfo(options);
  // Add app-config & dialog automatically
  return {
    bundleDirectory: options.bundleDir,
    skipActivation: !!options.skipActivation,
    comment: options.comment,
    actions: actionsManifest,
    ...appUploadSettings,
    ...appInfo,
  };
}

module.exports = {
  buildAppUploadSettings,
};
