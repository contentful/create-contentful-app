import { rename } from 'fs/promises';
import { resolve, join } from 'path';
import { CONTENTFUL_APP_MANIFEST, IGNORED_CLONED_FILES } from './constants';
import degit from 'degit';
import { highlight } from './logger';
import { exists, mergeJsonIntoFile } from './utils/file';
import { getAddBuildCommandFn } from './utils/package';

const addBuildCommand = getAddBuildCommandFn({
  name: 'build:functions',
  command: 'node build-functions.js',
});

const VALID_FUNCTION_TEMPLATES_DIRS = [
  'external-references',
  'appevent-filter',
  'appevent-handler',
  'appevent-transformation',
];

function functionTemplateFromName(functionName: string) {
  let dirName = functionName;
  if (!VALID_FUNCTION_TEMPLATES_DIRS.includes(dirName)) {
    console.error(
      `Invalid function template: ${functionName}. Must be one of ${VALID_FUNCTION_TEMPLATES_DIRS.join(
        ', '
      )}.`
    );
    process.exit(1);
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
    console.log(highlight(`---- Cloning function "${functionName}".`));
    // Clone the function template to the created directory under the folder 'actions'
    const templateSource = join(
      `contentful/apps/examples/function-${functionTemplateFromName(functionName)}`,
      templateIsJavascript ? 'javascript' : 'typescript'
    );

    const functionDirectoryPath = resolve(`${destination}/functions`);

    const d = degit(templateSource, { mode: 'tar', cache: false });
    await d.clone(functionDirectoryPath);

    // merge the manifest from the template folder to the root folder
    const writeAppManifest = mergeJsonIntoFile({
      source: `${functionDirectoryPath}/${CONTENTFUL_APP_MANIFEST}`,
      destination: `${destination}/${CONTENTFUL_APP_MANIFEST}`,
    });

    // move the build file from the actions folder to the root folder
    const copyBuildFile = rename(
      `${functionDirectoryPath}/build-functions.js`,
      `${destination}/build-functions.js`
    );

    // modify package.json build commands
    const packageJsonLocation = resolve(`${destination}/package.json`);
    const packageJsonExists = await exists(packageJsonLocation);

    if (!packageJsonExists) {
      console.error(
        `Failed to add function build commands: ${packageJsonLocation} does not exist.`
      );
      return;
    }

    const writeBuildCommand = mergeJsonIntoFile({
      source: `${functionDirectoryPath}/package.json`,
      destination: packageJsonLocation,
      mergeFn: addBuildCommand,
    });

    await Promise.all([writeAppManifest, copyBuildFile, writeBuildCommand]);

    await d.remove(functionDirectoryPath, destination, {
      action: 'remove',
      files: IGNORED_CLONED_FILES.map((fileName) => `${functionDirectoryPath}/${fileName}`),
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
