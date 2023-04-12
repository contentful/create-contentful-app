import inquirer from 'inquirer';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

function cloneAppAction(templateIsTypescript: boolean, destination: string) {
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
  writeFileSync(`${destination}/contentful-manifest.json`, JSON.stringify(manifest));
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
