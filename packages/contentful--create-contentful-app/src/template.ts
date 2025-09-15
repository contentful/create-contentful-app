import { resolve, dirname, basename } from 'path';
import { existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import * as rimraf from 'rimraf';
import { execSync } from 'child_process';
import { success } from './logger';
import { rmIfExists } from './utils';

function clone(source: string, destination: string) {
  try {
    if (existsSync(destination)) {
      try {
        const files = execSync(`ls -la "${destination}"`, { encoding: 'utf8' });
        if (files.split('\n').length > 3) {
          throw new Error('Destination directory is not empty.');
        }
      } catch {
        // Ignore
      }
    }

    if (isContentfulTemplate(source)) {
      cloneContentfulTemplate(source, destination);
    } else {
      // Try to handle external repositories
      execSync(`git clone --depth 1 "${source}" "${destination}"`, { stdio: 'ignore' });
      try {
        execSync(`rm -rf "${destination}/.git"`);
      } catch {
        // Ignore
      }
    }
  } catch (e: any) {
    if (e.message?.includes('Destination directory is not empty')) {
      throw e;
    }
    if (e.message?.includes('not found') || e.message?.includes('does not exist')) {
      throw new Error(`Repository not found: ${source}`);
    }
    throw new Error(`Failed to clone repository: ${e.message}`);
  }
}

function cloneContentfulTemplate(source: string, destination: string) {
  const templatePath = source.replace('contentful/apps/', '');

  const tempDir = resolve(
    tmpdir(),
    `contentful-clone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );

  try {
     execSync(`git clone --depth 1 https://github.com/contentful/apps.git "${tempDir}"`, {
       stdio: 'ignore',
     });

    try {
      execSync(`mkdir -p "${destination}"`);
    } catch {
      // Windows fallback
      try {
        execSync(`mkdir "${destination}"`);
      } catch {
        // Ignore
      }
    }

    const sourcePath = resolve(tempDir, templatePath);
    try {
      execSync(`cp -r "${sourcePath}"/* "${destination}"/`);
    } catch {
      execSync(`xcopy "${sourcePath}\\*" "${destination}\\" /E /I /Y`);
    }

    try {
      execSync(`rm -rf "${tempDir}"`);
    } catch {
      try {
        execSync(`rmdir /S /Q "${tempDir}"`);
      } catch {
        // Ignore
      }
    }
  } catch (error) {
    try {
      execSync(`rm -rf "${tempDir}"`);
    } catch {
      try {
        execSync(`rmdir /S /Q "${tempDir}"`);
      } catch {
        // Ignore
      }
    }
    throw error;
  }
}

function isContentfulTemplate(source: string): boolean {
  return source.startsWith('contentful/apps/');
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
  rmIfExists(resolve(destination, 'pnpm-lock.json'));
  rmIfExists(resolve(destination, 'package-lock.json'));
  rmIfExists(resolve(destination, 'yarn.lock'));
}

export function cloneTemplateIn(source: string, destination: string) {
  clone(source, destination);

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
