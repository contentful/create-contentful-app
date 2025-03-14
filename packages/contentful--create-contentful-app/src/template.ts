import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import tiged from 'tiged';
import * as rimraf from 'rimraf';
import { success } from './logger';
import { rmIfExists } from './utils';

async function clone(source: string, destination: string) {
  const d = tiged(source, { mode: 'tar', disableCache: true });

  try {
    await d.clone(destination);
  } catch (e: any) {
    if (e.code === 'DEST_NOT_EMPTY') {
      // In this case, we know that tiged will suggest users
      // provide a 'force' flag - this is a flag for tiged though
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
    throw new Error(`Invalid template: invalid ${packageJSONLocation}.`);
  }
}

function cleanUp(destination: string) {
  rmIfExists(resolve(destination, 'package-lock.json'));
  rmIfExists(resolve(destination, 'yarn.lock'));
}

export async function cloneTemplateIn(destination: string, source: string) {
  await clone(source, destination);

  try {
    validate(destination);
  } catch (e) {
    // cleanup in case of invalid example
    rimraf.sync(destination);
    throw e;
  }

  cleanUp(destination);
  console.log(success('Done!'));
}
