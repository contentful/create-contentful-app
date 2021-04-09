const glob = require('glob');
const chalk = require('chalk');
const fs = require('fs');
const JSZip = require('jszip');
const { showCreationError } = require('../utils');

async function convertPathToFileData(filePath) {
  return new Promise((res) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      res([filePath, data]);
    });
  });
}

function addFilesToZip(files, zip, path) {
  files.forEach(([filePath, data]) => {
    // remove the root path to not have the folder inside the zip
    let localPath = filePath;
    const firstIndex = filePath.indexOf(path);
    if (firstIndex === 0) {
      localPath = localPath.substring(localPath.length, path.length);
    }
    zip.file(localPath, data);
  });
  return zip;
}

async function createZipFileFromDirectory(path) {
  try {
    let zip = new JSZip();
    const filePaths = await new Promise((res) => {
      glob(path + '/**/*', { nodir: true }, (err, paths) => {
        res(paths);
      });
    });

    console.log(`
${chalk.blueBright('Info:')} Creating a zip file from ${filePaths.length} file${
      filePaths.length !== 1 ? 's' : ''
    }.`);

    const files = await Promise.all(filePaths.map(convertPathToFileData));
    zip = addFilesToZip(files, zip, path);
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

module.exports = {
  convertPathToFileData,
  createZipFileFromDirectory,
  addFilesToZip,
};
