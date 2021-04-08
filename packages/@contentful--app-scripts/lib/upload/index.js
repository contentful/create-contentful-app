const glob = require('glob');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs');
const JSZip = require('jszip');
const { buildAppUploadSettings } = require('./build-upload-settings');

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

async function createAppUpload(settings) {
  const zipFileSpinner = ora('Preparing your files for upload').start();
  // todo replace with real directory
  const zipFile = await createZipFileFromDirectory('./example');
  zipFileSpinner.stop();
  console.log(chalk.cyan(`Files successfully zipped`));
}

module.exports = {
  async interactive() {
    console.log(chalk.dim(`Creating an app upload`));
    const settings = await buildAppUploadSettings();
    createAppUpload(settings);
  },
  async nonInteractive() {
    console.log('NON-INTERACTIVE UPLOAD');
  },
};
