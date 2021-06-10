const ora = require('ora');
const { createZipFileFromDirectory } = require('./create-zip-from-directory');
const { validateBundle } = require('./validate-bundle');
const { showCreationError } = require('../utils');
const { createClient } = require('contentful-management');

async function createAppBundleFromFile(orgId, token, zip) {
  const client = await createClient({ accessToken: token });
  const org = await client.getOrganization(orgId);
  return await org.createAppUpload(zip);
}

async function createAppUpload(settings) {
  validateBundle(settings.bundleDirectory || '.');
  let appUpload = null;
  const zipFileSpinner = ora('Preparing your files for upload...').start();
  const zipFile = await createZipFileFromDirectory(settings.bundleDirectory || '.');
  zipFileSpinner.stop();

  if (!zipFile) return;

  const uploadSpinner = ora('Uploading your files...').start();
  try {
    appUpload = await createAppBundleFromFile(
      settings.organization.value,
      settings.accessToken,
      zipFile
    );
  } catch (err) {
    showCreationError('app bundle', err.message);
  }

  uploadSpinner.stop();
  return appUpload;
}

module.exports = {
  createAppUpload,
};
