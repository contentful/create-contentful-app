import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import degit from 'degit';
import rimraf from 'rimraf';

import { CLIOptions, ContentfulTemplate } from './types';
import { highlight, warn } from './logger';
import { rmIfExists } from './utils';

function isContentfulTemplate(url: string) {
  return Object.values(ContentfulTemplate).some(t => url.includes('contentful/apps/templates/' + t));
}

function makeContentfulTemplateSource(options: CLIOptions) {
  const name = options.Js ? ContentfulTemplate.Javascript : ContentfulTemplate.Typescript;
  return `contentful/apps/templates/${name}`;
}

function getTemplateSource(options: CLIOptions) {
  const source = options.templateSource ?? makeContentfulTemplateSource(options);

  if (!isContentfulTemplate(source)) {
    warn(`Template at ${highlight(source)} is not an official Contentful app template!`);
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
      `Invalid template: missing "${packageJSONLocation}".`
    );
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
    // cleanup in case of invalid template
    rimraf.sync(destination);
    throw e;
  }

  cleanUp(destination);
}
