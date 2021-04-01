const path = require('path')

const PACKAGES = [
  '@contentful/create-contentful-app',
  '@contentful/cra-template-create-contentful-app',
];
const MODULE_MAIN_PATH = path.resolve(__dirname, '..');
const PACKAGES_ROOT = path.resolve(MODULE_MAIN_PATH, '..');
const ORIGINAL_PACKAGE_JSON = require(`${MODULE_MAIN_PATH}/package.json`);

module.exports = {
  PACKAGES,
  MODULE_MAIN_PATH,
  PACKAGES_ROOT,
  ORIGINAL_PACKAGE_JSON,
};
