const glob = require('glob');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs');
const JSZip = require('jszip');
const { showCreationError } = require('../utils');
const { createClient } = require('contentful-management');

async function createZipFileFromDirectory(path) {
  try {
    const zip = new JSZip();

    const filePaths = await new Promise((res) => {
      glob(path + '/**/*', { nodir: true }, (err, paths) => {
        res(paths);
      });
    });

    console.log(`
${chalk.blueBright('Info:')} Creating a zip file from ${filePaths.length} file${
      filePaths.length !== 1 ? 's' : ''
    }.`);

    const files = await Promise.all(
      filePaths.map(
        (filePath) =>
          new Promise((res) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
              res([filePath, data]);
            });
          })
      )
    );
    files.forEach(([filePath, data]) => {
      // remove the root path to not have the folder inside the zip
      let localPath = filePath;
      const firstIndex = filePath.indexOf(path);
      if (firstIndex === 0) {
        localPath = localPath.substring(localPath.length, path.length);
      }
      zip.file(localPath, data);
    });
    const zipFile = await zip.generateAsync({ type: 'nodebuffer' });
    console.log('----------------------------');
    console.log(`${chalk.yellow('Done!')} Files from ${chalk.dim(path)} successfully zipped`);
    console.log('----------------------------');
    return zipFile;
  } catch (err) {
    showCreationError('zip file', err.message);
    return null;
  }
}

async function createAppBundleFromFile(orgId, token, zip) {
  const client = await createClient({ accessToken: token });
  const org = await client.getOrganization(orgId);
  return await org.createAppUpload(zip);
}

async function createAppUpload(settings) {
  let appUpload = null;
  const zipFileSpinner = ora('Preparing your files for upload').start();
  const zipFile = await createZipFileFromDirectory(settings['bundle-directory'] || '.');
  zipFileSpinner.stop();

  if (!zipFile) return;

  const uploadSpinner = ora('Uploading your files').start();
  try {
    appUpload = await createAppBundleFromFile(
      settings.organisation.value,
      settings.accessToken,
      zipFile
    );
  } catch (err) {
    showCreationError('app bundle', err.message);
  }

  uploadSpinner.stop();
  return appUpload;
}

exports.createAppUpload = createAppUpload;
