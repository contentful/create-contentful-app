import chalk from 'chalk';
import { join, resolve } from 'path';
import { rimraf } from 'rimraf';
import tiged from 'tiged';
import { CONTENTFUL_APP_MANIFEST, IGNORED_CLONED_FILES } from './constants';
import { error, highlight } from './logger';
import { InvalidTemplateError } from './types';
import { exists, mergeJsonIntoFile } from './utils/file';
import { getAddBuildCommandFn } from './utils/package';

// TODO: after appActions work we can change this getAddBuildCommandFn params from command -> defaultCommand as examples will have build commands
const addBuildCommand = getAddBuildCommandFn({
  name: 'build:functions',
  command: 'contentful-app-scripts build-functions --ci',
});

const VALID_FUNCTION_TEMPLATES_DIRS = [
  'appevent-filter',
  'appevent-handler',
  'appevent-transformation',
  'external-references',
  'comment-bot',
];

export function functionTemplateFromName(functionName: string, destination: string) {
  let dirName = functionName;
  if (!VALID_FUNCTION_TEMPLATES_DIRS.includes(dirName)) {
    // cleanup in case of invalid example
    rimraf.sync(destination);
    throw new InvalidTemplateError(
      `${chalk.red(`Invalid function template:`)} The function name ${highlight(
        chalk.cyan(functionName)
      )} is not valid. Must be one of: ${highlight(VALID_FUNCTION_TEMPLATES_DIRS.join(', '))}.`
    );
  }
  if (functionName === 'external-references') dirName = 'templates'; // backwards compatible for the apps repo examples folder for delivery functions (external-references)
  return dirName;
}

export async function cloneFunction(
  destination: string,
  templateIsJavascript: boolean,
  functionName: string
) {
  try {
    console.log(highlight(`---- Cloning function ${chalk.cyan(functionName)}...`));
    // Clone the function template to the created directory under the folder 'actions'
    const templateSource = join(
      `contentful/apps/examples/function-${functionTemplateFromName(functionName, destination)}`,
      templateIsJavascript ? 'javascript' : 'typescript'
    );

    const functionDirectoryPath = resolve(`${destination}/functions`);

    const d = tiged(templateSource, { mode: 'tar', disableCache: true });
    await d.clone(functionDirectoryPath);

    // merge the manifest from the template folder to the root folder
    const writeAppManifest = mergeJsonIntoFile({
      source: `${functionDirectoryPath}/${CONTENTFUL_APP_MANIFEST}`,
      destination: `${destination}/${CONTENTFUL_APP_MANIFEST}`,
    });

    // modify package.json build commands
    const packageJsonLocation = resolve(`${destination}/package.json`);
    const packageJsonExists = await exists(packageJsonLocation);

    if (!packageJsonExists) {
      throw new Error(
        `Failed to add function build commands: ${packageJsonLocation} does not exist.`
      );
    }

    const writeBuildCommand = mergeJsonIntoFile({
      source: `${functionDirectoryPath}/package.json`,
      destination: packageJsonLocation,
      mergeFn: addBuildCommand,
    });

    await Promise.all([writeAppManifest, writeBuildCommand]);

    await d.remove(functionDirectoryPath, destination, {
      action: 'remove',
      files: IGNORED_CLONED_FILES.map((fileName) => `${functionDirectoryPath}/${fileName}`),
    });
  } catch (e) {
    error(`Failed to clone function ${highlight(chalk.cyan(functionName))}`, e);
    process.exit(1);
  }
}
