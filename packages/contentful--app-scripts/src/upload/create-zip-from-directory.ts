import chalk from 'chalk';
import AdmZip from 'adm-zip';
import { showCreationError } from '../utils';
import { resolve } from 'node:path';

export async function createZipFileFromDirectory(path: string) {
  try {
    const zip = new AdmZip();
    zip.addLocalFolder(resolve(path));
    console.log("");
    console.log(`  ----------------------------

  ${chalk.yellow('Done!')} Files from ${chalk.dim(path)} successfully zipped.

  ----------------------------`);
    console.log("");

    return zip.toBuffer();
  } catch (err: any) {
    showCreationError('zip file', err.message);
    return null;
  }
}
