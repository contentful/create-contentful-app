import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import degit from 'degit';
import rimraf from 'rimraf';

import { CLIOptions, ContentfulExample } from './types';
import { highlight, warn } from './logger';
import { rmIfExists } from './utils';

const EXAMPLES_PATH = 'contentful/apps/examples/';

function isContentfulTemplate(url: string) {
  return Object.values(ContentfulExample).some(t => url.includes(EXAMPLES_PATH + t));
}

function makeContentfulExampleSource(options: CLIOptions) {
  if (options.example) {
    return EXAMPLES_PATH + options.example;
  }

  if (options.javascript) {
    return EXAMPLES_PATH + ContentfulExample.Javascript;
  }

  return EXAMPLES_PATH + ContentfulExample.Typescript;
}

function getTemplateSource(options: CLIOptions) {
  const source = options.source ?? makeContentfulExampleSource(options);

  if (options.source && !isContentfulTemplate(source)) {
    warn(`Template at ${highlight(source)} is not an official Contentful app template!`);
  }

  return source;
}

async function clone(source: string, destination: string) {
  const d = degit(source, { mode: 'tar', cache: false });

  try {
    await d.clone(destination);
  } catch (e: any) {
    // We know that this error suggests that the user try a 'force' option that
    // exists only in degit - so we want to hide that instruction.
    if (e.code === 'DEST_NOT_EMPTY') {
      throw new Error('Destination directory is not empty.');
    }

    console.error(e);
    throw new Error(e.message);
  }
}

function validate(destination: string): void {
  const packageJSONLocation = `${destination}/package.json`;
  if (!existsSync(packageJSONLocation)) {
    throw new Error(`Invalid template: missing "${packageJSONLocation}".`);
  }

  let packageJSON;
  try {
    packageJSON = JSON.parse(readFileSync(packageJSONLocation, 'utf-8'));
  } catch (e) {
    throw new Error(`Invalid template: invalid "${packageJSONLocation}".`);
  }

  if (!Object.keys(packageJSON.dependencies).includes('@contentful/app-sdk')) {
    throw new Error(`Invalid template: missing "@contentful/app-sdk" in "${packageJSONLocation}".`);
  }
}

function cleanUp(destination: string) {
  rmIfExists(resolve(destination, 'package-lock.json'));
  rmIfExists(resolve(destination, 'yarn.lock'));
}

export async function cloneTemplateIn(destination: string, options: CLIOptions) {
  const source = getTemplateSource(options);

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
