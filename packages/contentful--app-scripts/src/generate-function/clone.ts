// eslint-disable-next-line @typescript-eslint/no-var-requires
const tiged = require('tiged');
import fs from 'node:fs'

import chalk from 'chalk';
import { resolve } from 'node:path';
import { APP_MANIFEST, CONTENTFUL_APP_MANIFEST, IGNORED_CLONED_FILES, REPO_URL } from './constants';
import { error, highlight, warn } from './logger';
import { exists, mergeJsonIntoFile, whichExists } from './utils/file';
import { getAddBuildCommandFn } from './utils/package';
import { GenerateFunctionSettingsInput } from '../types';

const addBuildCommand = getAddBuildCommandFn({
  name: 'build:functions',
  command: 'contentful-app-scripts build-functions --ci',
});

export async function cloneFunction(
  localPath: string,
  settings: GenerateFunctionSettingsInput
) {
  try {
    console.log(highlight(`---- Cloning function ${chalk.cyan(settings.name)}...`));
    const { localTmpPath, localFunctionsPath } = resolvePaths(localPath);

    const cloneURL = getCloneURL(settings);
    // Pass keepPackageJson if available in settings (from GenerateFunctionSettingsCLI)
    const keepPackageJson = 'keepPackageJson' in settings && typeof settings.keepPackageJson === 'boolean' ? settings.keepPackageJson : false;
    await cloneAndResolveManifests(cloneURL, localTmpPath, localPath, localFunctionsPath, keepPackageJson);
    
    // now rename the function file. Find the file with a .ts or .js extension
    const renameFunctionFile = renameClonedFiles(localTmpPath, settings);

    // copy the cloned files to the functions directory
    moveFilesToFinalDirectory(localTmpPath, localFunctionsPath, localPath);
  
    // now alter the app-manifest.json to point to the new function file
    await touchupAppManifest(localPath, settings, renameFunctionFile);
  } catch (e) {
    error(`Failed to clone function ${highlight(chalk.cyan(settings.name))}`, e);
    throw Error(chalk.red('Failed to clone function ') + highlight(chalk.cyan(settings.name)));
  }
}

export function getCloneURL(settings: GenerateFunctionSettingsInput) {
  return `${REPO_URL}/${settings.example}/${settings.language}`;
}

export async function touchupAppManifest(localPath: string, settings: GenerateFunctionSettingsInput, renameFunctionFile: string) {
  const appManifestPath = resolve(localPath, CONTENTFUL_APP_MANIFEST);
  const appManifest = JSON.parse(fs.readFileSync(appManifestPath, 'utf-8'));
  const entry = appManifest["functions"][appManifest["functions"].length - 1];
  entry.id = settings.name;
  // the path always has a .js extension
  // and path and entryFile are always POSIX style paths
  entry.path = `functions/${renameFunctionFile.replace('.ts', '.js')}`;
  entry.entryFile = `functions/${renameFunctionFile}`;
  await fs.writeFileSync(appManifestPath, JSON.stringify(appManifest, null, 2));
}

export function moveFilesToFinalDirectory(localTmpPath: string, localFunctionsPath: string, localPath: string) {
  // Create functions directory if it doesn't exist
  if (!fs.existsSync(localFunctionsPath)) {
    fs.mkdirSync(localFunctionsPath, { recursive: true });
  }

  // Get all files from tmp directory
  const files = fs.readdirSync(localTmpPath);
  
  // Copy each file except package.json, if it exists
  for (const file of files) {
    const sourcePath = resolve(localTmpPath, file);
    if (file === 'package.json') {
      const destPath = resolve(localPath, 'package.json');
      fs.cpSync(sourcePath, destPath);
      continue;
    }
    const destPath = resolve(localFunctionsPath, file);
    fs.cpSync(sourcePath, destPath, { recursive: true });
  }
  
  // Clean up tmp directory
  fs.rmSync(localTmpPath, { recursive: true, force: true });
}

export function renameClonedFiles(localTmpPath: string, settings: GenerateFunctionSettingsInput) {
  const files = fs.readdirSync(localTmpPath);
  const functionFile: string | undefined = files.find((file: string) => file.endsWith('.ts') || file.endsWith('.js'));
  if (!functionFile) {
    throw new Error(`No function file found in ${localTmpPath}`);
  }
  const newFunctionFile = `${settings.name}.${settings.language === 'typescript' ? 'ts' : 'js'}`;
  fs.renameSync(resolve(localTmpPath, functionFile), resolve(localTmpPath, newFunctionFile));
  return newFunctionFile;
}

export function resolvePaths(localPath: string) {
  const localTmpPath = resolve(localPath, 'tmp'); // we require a tmp directory because tiged overwrites all files in the target directory
  const localFunctionsPath = resolve(localPath, 'functions');
  return { localTmpPath, localFunctionsPath };
}

export async function cloneAndResolveManifests(cloneURL: string, localTmpPath: string, localPath: string, localFunctionsPath: string, keepPackageJson = false) {
  const tigedInstance = await clone(cloneURL, localTmpPath);

  // merge the manifest from the template folder to the root folder
  await mergeAppManifest(localPath, localTmpPath);

  // create a deep copy of the IGNORED_CLONED_FILES array
  const ignoredFiles = Array.from(IGNORED_CLONED_FILES) 
  if (!keepPackageJson) {
    // modify package.json build commands
    await updatePackageJsonWithBuild(localPath, localTmpPath);
    ignoredFiles.push('package.json');
  }

  // check if a tsconfig.json file exists already
  const tsconfigExists = await exists(resolve(localFunctionsPath, 'tsconfig.json'));
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
  const finalAppManifestType = await exists(resolve(localPath, CONTENTFUL_APP_MANIFEST));
  const tmpAppManifestType = await whichExists(localTmpPath, [CONTENTFUL_APP_MANIFEST, APP_MANIFEST]); // find the app manifest in the cloned files

  if (!finalAppManifestType) {
    await mergeJsonIntoFile({
      source: resolve(localTmpPath, tmpAppManifestType),
      destination: resolve(localPath, CONTENTFUL_APP_MANIFEST), // always save as contentful-app-manifest.json
    });
  } else {
    // add the function to the json's "functions" array
    await mergeJsonIntoFile({
      source: resolve(localTmpPath, tmpAppManifestType),
      destination: resolve(localPath, CONTENTFUL_APP_MANIFEST),
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
  const packageJsonLocation = resolve(localPath, 'package.json');
  const packageJsonExists = await exists(packageJsonLocation);
  if (packageJsonExists) {
    await mergeJsonIntoFile({
      source: resolve(localTmpPath, 'package.json'),
      destination: packageJsonLocation,
      mergeFn: addBuildCommand,
    });
  } else {
    warn(`Failed to add function build commands: ${packageJsonLocation} does not exist.`);
  }
}