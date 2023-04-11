// @ts-check

const inquirer = require('inquirer');
const fs = require('fs');
const { getAppInfo } = require('../get-app-info');
const { showManifestValidationError, showAppManifestFound } = require('../utils');

const DEFAULT_MANIFEST_PATH = './contentful-app-manifest.json';

function getActionsManifest() {
  const isManifestExists = fs.existsSync(DEFAULT_MANIFEST_PATH);

  if (!isManifestExists) {
    return;
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(DEFAULT_MANIFEST_PATH, { encoding: 'utf8' }));

    if (!Array.isArray(manifest.actions) || manifest.actions.length === 0) {
      return;
    }

    return manifest.actions;
  } catch {
    showManifestValidationError(DEFAULT_MANIFEST_PATH);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
}

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
    showAppManifestFound(DEFAULT_MANIFEST_PATH);
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
