import inquirer from 'inquirer';
import { readFileSync, writeFileSync, existsSync, renameSync } from 'fs';
import { resolve } from 'path';
import { CONTENTFUL_APP_MANIFEST } from './constants';
import { cloneTemplateIn } from './template';

export function cloneAppAction(templateIsTypescript: boolean, destination: string) {
  // Clone the app actions template to the created directory under the folder 'actions'
  const templateSource = `contentful/apps/examples/hosted-app-actions-templates/${
    templateIsTypescript ? 'typescript' : 'javascript'
  }`;

  const appActionDirectoryPath = resolve(`${destination}/actions`);

  cloneTemplateIn(appActionDirectoryPath, templateSource);

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
  const packageJsonLocation = `${destination}/package.json`;
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
      'build-actions': `${
        templateIsTypescript ? 'tsc actions/*.ts --outDir build/actions' : 'node build-actions.js'
      }`,
      build: `${packageJson.scripts.build} && npm run build-actions`,
    },
  };
  writeFileSync(packageJsonLocation, JSON.stringify(updatedPackageJson, null, '  '));
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
    cloneAppAction(templateIsTypescript, fullAppFolder);
  }
};
