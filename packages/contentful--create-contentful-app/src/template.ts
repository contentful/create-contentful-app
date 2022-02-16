import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import degit from 'degit';
import rimraf from 'rimraf';

import { CLIOptions, ContentfulExample } from './types';
import { highlight, warn } from './logger';
import { rmIfExists } from './utils';

const EXAMPLES_PATH = 'contentful/apps/examples/';

function isContentfulExample(url: string) {
  return Object.values(ContentfulExample).some(t => url.includes('contentful/apps/examples/' + t));
}

function makeContentfulExampleSource(options: CLIOptions) {
  if (options.example) {
    return `${EXAMPLES_PATH}${options.example}`;
  }

  if (options.Js) {
    return `${EXAMPLES_PATH}${ContentfulExample.Javascript}`;
  }

  return `${EXAMPLES_PATH}${ContentfulExample.Typescript}`;
}

function getExampleSource(options: CLIOptions) {
  const source = options.source ?? makeContentfulExampleSource(options);

  if (!isContentfulExample(source)) {
    warn(`Example at ${highlight(source)} is not an official Contentful app example!`);
  }

  return source;
}

async function clone(source: string, destination: string) {
  const d = degit(source, { mode: 'tar' });

  try {
    await d.clone(destination);
  } catch (e: any) {
    let message = e.message ?? 'Unknown error';
    if (e.code === 'DEST_NOT_EMPTY') {
      message = 'Destination directory is not empty.';
    }
    throw new Error(message);
  }
}

function validate(destination: string): void {
  const packageJSONLocation = `${destination}/package.json`;
  if (!existsSync(packageJSONLocation)) {
    throw new Error(
      `Invalid example: missing "${packageJSONLocation}".`
    );
  }

  let packageJSON;
  try {
    packageJSON = JSON.parse(readFileSync(packageJSONLocation, 'utf-8'));
  } catch (e) {
    throw new Error(`Invalid example: invalid "${packageJSONLocation}".`);
  }

  if (!Object.keys(packageJSON.dependencies).includes('@contentful/app-sdk')) {
    throw new Error(`Invalid example: missing "@contentful/app-sdk" in "${packageJSONLocation}".`);
  }
}

function cleanUp(destination: string) {
  rmIfExists(resolve(destination, 'package-lock.json'));
  rmIfExists(resolve(destination, 'yarn.lock'));
}

export async function cloneExampleIn(destination: string, options: CLIOptions) {
  const source = getExampleSource(options);

  await clone(source, destination);

  try {
    validate(destination);
  } catch (e) {
    // cleanup in case of invalid example
    rimraf.sync(destination);
    throw e;
  }

  cleanUp(destination);
}
