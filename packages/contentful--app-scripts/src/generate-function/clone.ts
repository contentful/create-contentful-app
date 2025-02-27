// eslint-disable-next-line @typescript-eslint/no-var-requires
const tiged = require('tiged');
import fs from 'node:fs'

import chalk from 'chalk';
import { resolve } from 'path';
import { APP_MANIFEST, CONTENTFUL_APP_MANIFEST, IGNORED_CLONED_FILES, REPO_URL } from './constants';
import { error, highlight, warn } from './logger';
import { exists, mergeJsonIntoFile, whichExists } from './utils/file';
import { getAddBuildCommandFn } from './utils/package';
import { GenerateFunctionSettings } from '../types';

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
    const { localTmpPath, localFunctionsPath } = resolvePaths(localPath);

    const cloneURL = getCloneURL(settings);
    await cloneAndResolveManifests(cloneURL, localTmpPath, localPath, localFunctionsPath);
    
    // now rename the function file. Find the file with a .ts or .js extension
    const renameFunctionFile = renameClonedFiles(localTmpPath, settings);

    // copy the cloned files to the functions directory
    moveFilesToFinalDirectory(localTmpPath, localFunctionsPath);
  
    // now alter the app-manifest.json to point to the new function file
    await touchupAppManifest(localPath, settings, renameFunctionFile);
  } catch (e) {
    error(`Failed to clone function ${highlight(chalk.cyan(settings.name))}`, e);
    process.exit(1);
  }
}

export function getCloneURL(settings: GenerateFunctionSettings) {
  let cloneURL = `${REPO_URL}/${settings.sourceName}`; // this is the default for template
  if (settings.sourceType === 'example') {
    cloneURL = `${REPO_URL}/${settings.sourceName}/${settings.language}`;
  }
  return cloneURL;
}

export async function touchupAppManifest(localPath: string, settings: GenerateFunctionSettings, renameFunctionFile: string) {
  const appManifest = JSON.parse(fs.readFileSync(`${localPath}/${CONTENTFUL_APP_MANIFEST}`, 'utf-8'));
  const entry = appManifest["functions"][appManifest["functions"].length - 1];
  entry.id = settings.name;
  // the path always has a .js extension
  entry.path = `functions/${renameFunctionFile.replace('.ts', '.js')}`;
  entry.entryFile = `functions/${renameFunctionFile}`;
  await fs.writeFileSync(`${localPath}/${CONTENTFUL_APP_MANIFEST}`, JSON.stringify(appManifest, null, 2));
}

export function moveFilesToFinalDirectory(localTmpPath: string, localFunctionsPath: string) {
  fs.cpSync(localTmpPath, localFunctionsPath, {recursive: true});
  fs.rmSync(localTmpPath, { recursive: true, force: true });
}

export function renameClonedFiles(localTmpPath: string, settings: GenerateFunctionSettings) {
  const files = fs.readdirSync(localTmpPath);
  const functionFile: string | undefined = files.find((file: string) => file.endsWith('.ts') || file.endsWith('.js'));
  if (!functionFile) {
    throw new Error(`No function file found in ${localTmpPath}`);
  }
  const newFunctionFile = `${settings.name}.${settings.language === 'typescript' ? 'ts' : 'js'}`;
  fs.renameSync(`${localTmpPath}/${functionFile}`, `${localTmpPath}/${newFunctionFile}`);
  return newFunctionFile;
}

export function resolvePaths(localPath: string) {
  const localTmpPath = resolve(`${localPath}/tmp`); // we require a tmp directory because tiged overwrites all files in the target directory
  const localFunctionsPath = resolve(`${localPath}/functions`);
  return { localTmpPath, localFunctionsPath };
}

export async function cloneAndResolveManifests(cloneURL: string, localTmpPath: string, localPath: string, localFunctionsPath: string) {
  const tigedInstance = await clone(cloneURL, localTmpPath);

  // merge the manifest from the template folder to the root folder
  await mergeAppManifest(localPath, localTmpPath);

  // modify package.json build commands
  await updatePackageJsonWithBuild(localPath, localTmpPath);

  // check if a tsconfig.json file exists already
  const ignoredFiles = IGNORED_CLONED_FILES
  const tsconfigExists = await exists(`${localFunctionsPath}/tsconfig.json`);
  if (tsconfigExists) {
    ignoredFiles.push('tsconfig.json')
  } 

  // remove the cloned files that we've already merged
  await tigedInstance.remove("unused_param", localTmpPath, {
      action: 'remove',
      files: ignoredFiles.map((fileName) => `${localTmpPath}/${fileName}`),
    });
}

export async function clone(cloneURL: string, localFunctionsPath: string) {
  const tigedInstance = tiged(cloneURL, { mode: 'tar', disableCache: true, force: true });
  await tigedInstance.clone(localFunctionsPath);
  return tigedInstance
}

export async function mergeAppManifest(localPath: string, localTmpPath: string) {
  const finalAppManifestType = await exists(`${localPath}/${CONTENTFUL_APP_MANIFEST}`);
  const tmpAppManifestType = await whichExists(localTmpPath, [CONTENTFUL_APP_MANIFEST, APP_MANIFEST]); // find the app manifest in the cloned files

  if (!finalAppManifestType) {
    await mergeJsonIntoFile({
      source: `${localTmpPath}/${tmpAppManifestType}`,
      destination: `${localPath}/${CONTENTFUL_APP_MANIFEST}`, // always save as contentful-app-manifest.json
    });
  } else {
    // add the function to the json's "functions" array
    await mergeJsonIntoFile({
      source: `${localTmpPath}/${tmpAppManifestType}`,
      destination: `${localPath}/${CONTENTFUL_APP_MANIFEST}`,
      mergeFn: (destinationJson = {}, sourceJson = {}) => {
        if (!destinationJson.functions) {
          destinationJson.functions = [];
        }
        if (sourceJson.functions && sourceJson.functions.length > 0) {
          destinationJson.functions.push(sourceJson.functions[0]);
        }
        return destinationJson;
      },
    });
  }
}

export async function updatePackageJsonWithBuild(localPath: string, localTmpPath: string) {
  const packageJsonLocation = resolve(`${localPath}/package.json`);
  const packageJsonExists = await exists(packageJsonLocation);
  if (packageJsonExists) {
    await mergeJsonIntoFile({
      source: `${localTmpPath}/package.json`,
      destination: packageJsonLocation,
      mergeFn: addBuildCommand,
    });
  } else {
    warn("Failed to add function build commands: ${packageJsonLocation} does not exist.");
  }
}