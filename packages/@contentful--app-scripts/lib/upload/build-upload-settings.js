// @ts-check

const inquirer = require('inquirer');
const { getAppInfo } = require('../get-app-info');

async function buildAppUploadSettings(options) {
  const prompts = [];
  if (!options.bundleDir) {
    prompts.push({
      name: 'bundleDirectory',
      message: `Bundle directory, if not current:`,
      default: '.',
    });
  }
  if (!options.comment) {
    prompts.push({
      name: 'comment',
      message: `Add a comment to the created bundle:`,
      default: '',
    });
  }
  if (!options.skipActivation) {
    prompts.push({
      name: 'skipActivation',
      message: `Skip automatic activation of the bundle:`,
      type: 'confirm',
      default: false,
    });
  }

  const appUploadSettings = await inquirer.prompt(prompts);

  const appInfo = await getAppInfo(options);
  // Add app-config & dialog automatically
  return {
    bundleDirectory: options.bundleDir,
    skipActivation: options.skipActivation,
    comment: options.comment,
    ...appUploadSettings,
    ...appInfo,
  };
}

module.exports = {
  buildAppUploadSettings,
};
