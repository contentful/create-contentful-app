import inquirer from 'inquirer';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

export function cloneAppAction(templateIsTypescript: boolean, destination: string) {
  const actionPath = resolve(
    templateIsTypescript
      ? 'src/app-actions/typescript/index.ts'
      : 'src/app-actions/javascript/index.js'
  );

  const manifestPath = resolve(
    templateIsTypescript
      ? 'src/app-actions/typescript/manifest.json'
      : 'src/app-actions/javascript/manifest.json'
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
  writeFileSync(`${destination}/contentful-app-manifest.json`, JSON.stringify(manifest));

  // modify package.json with build commands
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
      'clean-actions': '-rimraf build/actions',
      // 'build-actions': 'build command',
      // build: `${packageJson.scripts.build} && build-actions`,
    },
  };
  writeFileSync(packageJsonLocation, JSON.stringify(updatedPackageJson));

  return;
}

type PromptIncludeAppAction = ({
  fullAppFolder,
  templateSource,
}: {
  fullAppFolder: string;
  templateSource: string;
}) => void;

export const promptIncludeAppAction: PromptIncludeAppAction = async ({
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
