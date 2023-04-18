import inquirer from 'inquirer';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import { CONTENTFUL_APP_MANIFEST } from './constants';

export function cloneAppAction(templateIsTypescript: boolean, destination: string) {
  const actionPath = resolve(
    templateIsTypescript
      ? 'src/app-actions/typescript/index.ts'
      : 'src/app-actions/javascript/index.js'
  );

  const manifestPath = resolve(
    templateIsTypescript
      ? `src/app-actions/typescript/${CONTENTFUL_APP_MANIFEST}`
      : `src/app-actions/javascript/${CONTENTFUL_APP_MANIFEST}`
  );

  // write the action
  const appAction = readFileSync(actionPath, { encoding: 'utf-8' }).toString();
  const appActionDirectoryPath = `${destination}/actions`;
  mkdirSync(appActionDirectoryPath);
  writeFileSync(
    `${appActionDirectoryPath}/example${templateIsTypescript ? '.ts' : '.js'}`,
    appAction
  );

  // write the manifest
  const manifest = JSON.parse(readFileSync(manifestPath, { encoding: 'utf-8' }));
  writeFileSync(`${destination}/${CONTENTFUL_APP_MANIFEST}`, JSON.stringify(manifest));

  // write the build file if necessary
  if (!templateIsTypescript) {
    const buildFilePath = 'src/app-actions/javascript/build-actions.js';
    const buildFile = readFileSync(buildFilePath, { encoding: 'utf-8' }).toString();
    writeFileSync(`${destination}/build-actions.js`, buildFile);
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
      build: `${packageJson.scripts.build} && build-actions`,
    },
  };
  writeFileSync(packageJsonLocation, JSON.stringify(updatedPackageJson));
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
