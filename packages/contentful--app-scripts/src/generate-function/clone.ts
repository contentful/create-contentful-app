import fs from 'node:fs'
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';

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
  const localTmpPath = resolve(localPath, 'tmp');
  const localFunctionsPath = resolve(localPath, 'functions');
  return { localTmpPath, localFunctionsPath };
}

export async function cloneAndResolveManifests(cloneURL: string, localTmpPath: string, localPath: string, localFunctionsPath: string, keepPackageJson = false) {
  await clone(cloneURL, localTmpPath);

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
  removeIgnoredFiles(localTmpPath, ignoredFiles);
}

export function removeIgnoredFiles(localTmpPath: string, ignoredFiles: string[]) {
  for (const fileName of ignoredFiles) {
    const filePath = resolve(localTmpPath, fileName);
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath, { recursive: true, force: true });
    }
  }
}

// Parse the trusted REPO_URL constant to extract canonical owner, repo, and base path
// REPO_URL format: https://github.com/contentful/apps/function-examples
const REPO_URL_MATCH = REPO_URL.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/(.+)$/);
if (!REPO_URL_MATCH) {
  throw new Error('Invalid REPO_URL constant configuration');
}
const [, CANONICAL_OWNER, CANONICAL_REPO, CANONICAL_BASE_PATH] = REPO_URL_MATCH;
const CANONICAL_REPO_URL = `https://github.com/${CANONICAL_OWNER}/${CANONICAL_REPO}.git`;

// Strict validation regex for subfolder path segments (alphanumeric, dash, underscore only)
const SAFE_PATH_SEGMENT_REGEX = /^[a-zA-Z0-9_-]+$/;

export async function clone(cloneURL: string, localFunctionsPath: string) {
  // Validate that cloneURL starts with the trusted REPO_URL
  if (!cloneURL.startsWith(REPO_URL)) {
    throw new Error(`Invalid clone URL: must start with ${REPO_URL}`);
  }

  // Extract only the user-supplied portion (example/language) after REPO_URL
  const userSuppliedPath = cloneURL.slice(REPO_URL.length);
  
  // Remove leading slash if present and validate format
  const trimmedPath = userSuppliedPath.startsWith('/') ? userSuppliedPath.slice(1) : userSuppliedPath;
  
  if (!trimmedPath) {
    throw new Error('Invalid clone URL: missing example/language path');
  }

  // Validate each path segment for safe characters only
  const pathSegments = trimmedPath.split('/');
  for (const segment of pathSegments) {
    if (!segment || !SAFE_PATH_SEGMENT_REGEX.test(segment)) {
      throw new Error(`Invalid clone URL: path segment "${segment}" contains unsafe characters`);
    }
  }

  // Build the full subfolder path from the trusted base + validated user path
  const subfolderPath = `${CANONICAL_BASE_PATH}/${trimmedPath}`;

  const tempDir = resolve(
    tmpdir(),
    `contentful-clone-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
  );

  try {
    // Clone using ONLY the canonical repo URL derived from trusted REPO_URL constant
    // execFileSync with array args prevents shell injection
    execFileSync('git', ['clone', '--depth', '1', CANONICAL_REPO_URL, tempDir], { stdio: 'ignore' });

    // Create destination directory
    if (!fs.existsSync(localFunctionsPath)) {
      fs.mkdirSync(localFunctionsPath, { recursive: true });
    }

    // Copy the subfolder contents to destination
    const sourcePath = resolve(tempDir, subfolderPath);
    
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Subfolder not found: ${subfolderPath}`);
    }

    // Copy files using native fs.cpSync (Node 16.7+, safe from injection)
    copyDirectoryContents(sourcePath, localFunctionsPath);
  } finally {
    // Clean up temp directory using native fs (Node 14.14+)
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors - temp directory will be cleaned by OS eventually
    }
  }
}

function copyDirectoryContents(sourcePath: string, destPath: string) {
  const entries = fs.readdirSync(sourcePath, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcFile = resolve(sourcePath, entry.name);
    const destFile = resolve(destPath, entry.name);
    
    fs.cpSync(srcFile, destFile, { recursive: true });
  }
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