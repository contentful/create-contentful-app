const chalk = require('chalk');
const AdmZip = require('adm-zip');
const { showCreationError } = require('../utils');

async function createZipFileFromDirectory(path) {
  try {
    const zip = new AdmZip();
    zip.addLocalFolder(path);
    console.log("");
    console.log(`  ----------------------------

  ${chalk.yellow('Done!')} Files from ${chalk.dim(path)} successfully zipped.

  ----------------------------`);
    console.log("");

    return zip.toBuffer();
  } catch (err) {
    showCreationError('zip file', err.message);
    return null;
  }
}

module.exports = {
  createZipFileFromDirectory,
};
