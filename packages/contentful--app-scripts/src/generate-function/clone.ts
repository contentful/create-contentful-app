const tiged = require('tiged');
const fs = require('fs-extra')

import chalk from 'chalk';
import { resolve } from 'path';
import { APP_MANIFEST, IGNORED_CLONED_FILES, REPO_URL } from './constants';
import { error, highlight, warn } from './logger';
import { exists, mergeJsonIntoFile } from './utils/file';
import { getAddBuildCommandFn } from './utils/package';
import { GenerateFunctionSettings } from './build-function-settings';

const addBuildCommand = getAddBuildCommandFn({
  name: 'build:functions',
  command: 'contentful-app-scripts build-functions --ci',
});

export async function cloneFunction(
  localPath: string,
  settings: GenerateFunctionSettings
) {
  try {
    console.log(highlight(`---- Cloning function ${chalk.cyan(settings.name)}...`));
    const localTmpPath = resolve(`${localPath}/tmp`);
    const localFunctionsPath = resolve(`${localPath}/functions`);

    let cloneURL = `${REPO_URL}/${settings.sourceName}`; // this is the default for template
    if (settings.sourceType === 'example') {
      cloneURL = `${REPO_URL}/${settings.sourceName}/${settings.language}`;
    }
    await cloneAndResolveManifests(cloneURL, localTmpPath, localPath);

    await fs.copy(localTmpPath, localFunctionsPath);
    await fs.remove(localTmpPath);

    // now rename the function file. For now assume it is called example.ts or example.js?
    const functionFile = settings.language === 'typescript' ? 'example.ts' : 'example.js';
    const newFunctionFile = `${settings.name}.${settings.language === 'typescript' ? 'ts' : 'js'}`;
    await fs.rename(`${localFunctionsPath}/${functionFile}`, `${localFunctionsPath}/${newFunctionFile}`);

  } catch (e) {
    error(`Failed to clone function ${highlight(chalk.cyan(settings.name))}`, e);
    process.exit(1);
  }
}

async function cloneAndResolveManifests(cloneURL: string, localFunctionsPath: string, localPath: string) {
  const tigedInstance = await clone(cloneURL, localFunctionsPath);

  // merge the manifest from the template folder to the root folder
  await mergeAppManifest(localPath, localFunctionsPath);

  // modify package.json build commands
  await updatePackageJsonWithBuild(localPath, localFunctionsPath);

  await tigedInstance.remove("unused_param", localFunctionsPath, {
      action: 'remove',
      files: IGNORED_CLONED_FILES.map((fileName) => `${localFunctionsPath}/${fileName}`),
    });
}

async function clone(cloneURL: string, localFunctionsPath: string) {
  const tigedInstance = tiged(cloneURL, { mode: 'tar', disableCache: true, force: true });
  await tigedInstance.clone(localFunctionsPath);
  return tigedInstance
}

async function mergeAppManifest(localPath: string, localFunctionsPath: string) {
  let writeAppManifest: Promise<void> | undefined;
  const appManifestExists = await exists(`${localPath}/${APP_MANIFEST}`);
  console.log(`App manifest source path: ${localFunctionsPath}/${APP_MANIFEST}`);
  if (!appManifestExists) {
    writeAppManifest = mergeJsonIntoFile({
      source: `${localFunctionsPath}/${APP_MANIFEST}`,
      destination: `${localPath}/${APP_MANIFEST}`,
    });
  }
}

async function updatePackageJsonWithBuild(localPath: string, localFunctionsPath: string) {
  const packageJsonLocation = resolve(`${localPath}/package.json`);
  const packageJsonExists = await exists(packageJsonLocation);
  if (packageJsonExists) {
    const writeBuildCommand = mergeJsonIntoFile({
      source: `${localFunctionsPath}/package.json`,
      destination: packageJsonLocation,
      mergeFn: addBuildCommand,
    });

    await writeBuildCommand;
  } else {
    warn("Failed to add function build commands: ${packageJsonLocation} does not exist.");
  }
}