import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import degit from 'degit';
import rimraf from 'rimraf';

import { CLIOptions } from './types';
import { success, } from './logger';
import { rmIfExists } from './utils';

async function clone(source: string, destination: string) {
  const d = degit(source, { mode: 'tar', cache: false });

  try {
    await d.clone(destination);
  } catch (e: any) {
    if (e.code === 'DEST_NOT_EMPTY') {
      // In this case, we know that degit will suggest users
      // provide a 'force' flag - this is a flag for degit though
      // and not CCA. So we swallow the details of this error
      // to avoid confusing people.
      throw new Error('Destination directory is not empty.');
    }
    throw e;
  }
}

function validate(destination: string): void {
  const packageJSONLocation = `${destination}/package.json`;
  if (!existsSync(packageJSONLocation)) {
    throw new Error(`Invalid template: missing "${packageJSONLocation}".`);
  }

  try {
    JSON.parse(readFileSync(packageJSONLocation, 'utf-8'));
  } catch (e) {
    throw new Error(`Invalid template: invalid "${packageJSONLocation}".`);
  }
}

function cleanUp(destination: string) {
  rmIfExists(resolve(destination, 'package-lock.json'));
  rmIfExists(resolve(destination, 'yarn.lock'));
}

export async function cloneTemplateIn(destination: string, source: string) {
  await clone(source, destination);
  console.log(success('Done!'));

  try {
    validate(destination);
  } catch (e) {
    // cleanup in case of invalid example
    rimraf.sync(destination);
    throw e;
  }

  cleanUp(destination);
}
