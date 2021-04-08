const glob = require('glob');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs');
const fetch = require('node-fetch');
const JSZip = require('jszip');
const { createClient } = require('contentful-management');

async function createZipFileFromDirectory(path) {
  const zip = new JSZip();

  const filePaths = await new Promise((res) => {
    glob(path + '/**/*', { nodir: true }, (err, paths) => {
      res(paths);
    });
  });
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
  files.forEach(([path, data]) => {
    zip.file(path, data);
  });
  return await zip.generateAsync({ type: 'string' });
}

async function createAppBundleFromFile(orgId, token, zip) {
  const client = await createClient({ accessToken: token });
  const org = await client.getOrganization(orgId);
  const appUpload = await org.createAppUpload(zip);
  return appUpload;
}

async function createAppUpload(settings) {
  const zipFileSpinner = ora('Preparing your files for upload').start();
  // todo replace with real directory
  const zipFile = await createZipFileFromDirectory('./example');
  zipFileSpinner.stop();
  console.log(chalk.cyan(`Files successfully zipped`));
  const uploadSpinner = ora('Uploading your files').start();
  await createAppBundleFromFile(settings.orgId, settings.mgmToken, zipFile);
  uploadSpinner.stop();
}

exports.createAppUpload = createAppUpload;
