import { resolve, dirname, basename } from 'path';
import { existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import * as rimraf from 'rimraf';
import { exec } from 'child_process';
import { promisify } from 'util';
import { success } from './logger';
import { rmIfExists } from './utils';

const execAsync = promisify(exec);

async function clone(source: string, destination: string) {
  try {
    // Check if destination exists and is not empty
    if (existsSync(destination)) {
      const files = await execAsync(`ls -la "${destination}"`).catch(() => ({ stdout: '' }));
      if (files.stdout.split('\n').length > 3) {
        // More than just ., .., and empty line
        throw new Error('Destination directory is not empty.');
      }
    }

    if (isContentfulTemplate(source)) {
      await cloneContentfulTemplate(source, destination);
    } else {
      // Try to handle external repositories
      await execAsync(`git clone --depth 1 "${source}" "${destination}"`);
      await execAsync(`rm -rf "${destination}/.git"`);
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

async function cloneContentfulTemplate(source: string, destination: string) {
  const templatePath = source.replace('contentful/apps/', '');

  // Create temp directory in system temp folder (completely out of sight)
  const tempDir = resolve(
    tmpdir(),
    `contentful-clone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );

  try {
    await execAsync(`git clone --depth 1 https://github.com/contentful/apps.git "${tempDir}"`);

    // Create destination directory
    await execAsync(`mkdir -p "${destination}"`).catch(() => {
      return execAsync(`mkdir "${destination}"`); // windows fallback
    });

    // Copy files
    const sourcePath = resolve(tempDir, templatePath);
    await execAsync(`cp -r "${sourcePath}"/* "${destination}"/`).catch(() => {
      return execAsync(`xcopy "${sourcePath}\\*" "${destination}\\" /E /I /Y`);
    });

    // Clean up temp directory
    await execAsync(`rm -rf "${tempDir}"`).catch(() => {
      return execAsync(`rmdir /S /Q "${tempDir}"`);
    });
  } catch (error) {
    // Clean up temp directory on error
    await execAsync(`rm -rf "${tempDir}"`).catch(() => {
      return execAsync(`rmdir /S /Q "${tempDir}"`)
    });
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

export async function cloneTemplateIn(source: string, destination: string) {
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
