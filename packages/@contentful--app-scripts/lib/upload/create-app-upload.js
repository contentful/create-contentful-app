const glob = require('glob');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs');
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
  return await zip.generateAsync({ type: 'nodebuffer' });
}

async function createAppBundleFromFile(orgId, token, zip) {
  const client = await createClient({ accessToken: token });
  const org = await client.getOrganization(orgId);
  return await org.createAppUpload(zip);
}

async function createAppUpload(settings) {
  const zipFileSpinner = ora('Preparing your files for upload').start();
  // todo replace with real directory
  const zipFile = await createZipFileFromDirectory('./example');
  zipFileSpinner.stop();
  console.log('----------------------------');
  console.log(
    `${chalk.yellow('Done!')} Files from ${chalk.dim(
      settings['bundle-directory']
    )} successfully zipped`
  );
  console.log('----------------------------');
  const uploadSpinner = ora('Uploading your files').start();
  const appUpload = await createAppBundleFromFile(
    settings.organisation.value,
    settings.accessToken,
    zipFile
  );
  uploadSpinner.stop();
  return appUpload;
}

exports.createAppUpload = createAppUpload;
