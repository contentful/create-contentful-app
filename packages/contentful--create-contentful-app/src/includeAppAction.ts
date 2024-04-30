import inquirer from 'inquirer';
import { rename } from 'fs/promises';
import { resolve, join } from 'path';
import { CONTENTFUL_APP_MANIFEST, IGNORED_CLONED_FILES } from './constants';
import tiged from 'tiged';
import { highlight } from './logger';
import { getAddBuildCommandFn } from './utils/package';
import { exists, mergeJsonIntoFile } from './utils/file';

const addBuildCommand = getAddBuildCommandFn({
  name: 'build:actions',
  command: 'node build-actions.js',
});

export async function cloneAppAction(destination: string, templateIsJavascript: boolean) {
  try {
    console.log(highlight('---- Cloning hosted app action.'));
    // Clone the app actions template to the created directory under the folder 'actions'
    const templateSource = join(
      'contentful/apps/examples/hosted-app-action-templates',
      templateIsJavascript ? 'javascript' : 'typescript',
    );

    const appActionDirectoryPath = resolve(`${destination}/actions`);

    const d = await tiged(templateSource, { mode: 'tar', cache: false });
    await d.clone(appActionDirectoryPath);

    // move the manifest from the actions folder to the root folder
    const writeAppManifest = await mergeJsonIntoFile({
      source: `${appActionDirectoryPath}/${CONTENTFUL_APP_MANIFEST}`,
      destination: `${destination}/${CONTENTFUL_APP_MANIFEST}`,
    });

    // move the build file from the actions folder to the root folder
    const copyBuildFile = await rename(
      `${appActionDirectoryPath}/build-actions.js`,
      `${destination}/build-actions.js`,
    );

    // modify package.json build commands
    const packageJsonLocation = resolve(`${destination}/package.json`);
    const packageJsonExists = await exists(packageJsonLocation);

    if (!packageJsonExists) {
      console.error(
        `Failed to add app action build commands: ${packageJsonLocation} does not exist.`,
      );
      return;
    }

    const writeBuildCommand = await mergeJsonIntoFile({
      source: `${appActionDirectoryPath}/package.json`,
      destination: packageJsonLocation,
      mergeFn: addBuildCommand,
    });

    await Promise.all([writeAppManifest, copyBuildFile, writeBuildCommand]);
    await d.remove(appActionDirectoryPath, destination, { action: 'remove', files: IGNORED_CLONED_FILES.map(fileName => `${appActionDirectoryPath}/${fileName}`) })
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
}

type PromptIncludeAppAction = ({
  fullAppFolder,
  templateSource,
}: {
  fullAppFolder: string;
  templateSource: string;
}) => void;

export const promptIncludeActionInTemplate: PromptIncludeAppAction = async ({
  fullAppFolder,
  templateSource,
}) => {
  const { includeAppAction } = await inquirer.prompt([
    {
      name: 'includeAppAction',
      message: 'Do you want to include a hosted app action?',
      type: 'confirm',
      default: false,
    },
  ]);

  // put app action into the template
  if (includeAppAction) {
    const templateIsTypescript = templateSource.includes('typescript');
    cloneAppAction(fullAppFolder, templateIsTypescript);
  }
};
