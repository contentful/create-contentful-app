import inquirer from 'inquirer';
import { readFileSync, writeFileSync, existsSync, renameSync } from 'fs';
import { resolve, join } from 'path';
import { CONTENTFUL_APP_MANIFEST } from './constants';
import degit from 'degit';
import { success, highlight } from './logger';

export async function cloneAppAction(destination: string, templateIsTypescript: boolean) {
  try {
    console.log(highlight('---- Cloning hosted app action.'));
    // Clone the app actions template to the created directory under the folder 'actions'
    const templateSource = join(
      'contentful/apps/examples/hosted-app-action-templates',
      templateIsTypescript ? 'typescript' : 'javascript'
    );

    const appActionDirectoryPath = resolve(`${destination}/actions`);

    const d = await degit(templateSource, { mode: 'tar', cache: false });
    await d.clone(appActionDirectoryPath);

    // move the manifest from the actions folder to the root folder
    renameSync(
      `${appActionDirectoryPath}/${CONTENTFUL_APP_MANIFEST}`,
      `${destination}/${CONTENTFUL_APP_MANIFEST}`
    );

    // move the build file from the actions folder to the root folder, if necessary
    if (!templateIsTypescript) {
      renameSync(`${appActionDirectoryPath}/build-actions.js`, `${destination}/build-actions.js`);
    }

    // modify package.json build commands
    const packageJsonLocation = resolve(`${destination}/package.json`);
    const packageJsonExists = existsSync(packageJsonLocation);

    if (!packageJsonExists) {
      console.error('Failed to add app action build commands.');
      return;
    }

    const packageJson = JSON.parse(readFileSync(packageJsonLocation, { encoding: 'utf-8' }));
    const updatedPackageJson = {
      ...packageJson,
      scripts: {
        ...packageJson.scripts,
        'build-actions': 'node build-actions.js',
        build: `${packageJson.scripts.build} && npm run build-actions`,
      },
    };
    writeFileSync(packageJsonLocation, JSON.stringify(updatedPackageJson, null, '  '));
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
