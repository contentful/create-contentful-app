// @ts-check

const inquirer = require('inquirer');
const fs = require('fs');
const { getAppInfo } = require('../get-app-info');
const { throwManifestValidationError } = require('../utils');

const DEFAULT_MANIFEST_PATH = './contentful-app-manifest.json';

function getActionsManifest() {
  const isManifestExists = fs.existsSync(DEFAULT_MANIFEST_PATH);

  if (!isManifestExists) return undefined;

  try {
    const manifest = JSON.parse(fs.readFileSync(DEFAULT_MANIFEST_PATH, { encoding: 'utf8' }));

    if (!Array.isArray(manifest.actions) || manifest.actions.length === 0) {
      return undefined;
    }

    return manifest.actions;
  } catch {
    throwManifestValidationError();
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
