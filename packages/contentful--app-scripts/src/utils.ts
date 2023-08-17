import fs from 'fs';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { cacheEnvVars } from '../utils/cache-credential';
import { Definition } from './definition-api';
import { Organization } from './organization-api';

const DEFAULT_MANIFEST_PATH = './contentful-app-manifest.json';

interface FunctionAppAction {
  id: string;
  name: string;
  description?: string;
  category: 'Custom';
  type: 'function';
  path: string;
  allowNetworks?: string[];
  entryFile?: string;
}

export const throwValidationException = (subject: string, message?: string, details?: string) => {
  console.log(`${chalk.red('Validation Error:')} Missing or invalid ${subject}.`);
  message && console.log(message);
  details && console.log(`${chalk.dim(details)}`);

  throw new TypeError(message);
};

export const isValidNetwork = (address: string) => {
  const addressRegex =
    /^(?:localhost|(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|(\[(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}\]|(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}))(?::\d{1,5})?$/;
  return addressRegex.test(address);
};

export const stripProtocol = (url: string) => {
  const protocolRemovedUrl = url.replace(/^https?:\/\//, '');

  return protocolRemovedUrl.split('/')[0];
};

export const showCreationError = (subject: string, message: string) => {
  console.log(`
    ${chalk.red('Creation error:')}

      Something went wrong while creating the ${chalk.bold(subject)}.

      Message:  ${chalk.red(message)}
    `);
};

export const throwError = (err: Error, message: string) => {
  console.log(`
${chalk.red('Error:')} ${message}.

${err.message}
    `);

  throw err;
};

export const selectFromList = async <T extends (Definition | Organization)>(
  list: T[],
  message: string,
  cachedOptionEnvVar: string,
): Promise<T> => {
  const cachedEnvVar = process.env[cachedOptionEnvVar];
  const cachedElement = list.find((item) => item.value === cachedEnvVar);

  if (cachedElement) {
    console.log(`
  ${message}
  Using environment variable: ${cachedElement.name} (${chalk.blue(cachedElement.value)})
    `);
    return cachedElement;
  } else {
    const { elementId } = await inquirer.prompt([
      {
        name: 'elementId',
        message: message,
        type: 'list',
        choices: list,
      },
    ]);

    if (cachedOptionEnvVar) {
      await cacheEnvVars({ [cachedOptionEnvVar]: elementId });
    }

    return list.find((el) => el.value === elementId) as T;
  }
};

export function getActionsManifest() {
  const isManifestExists = fs.existsSync(DEFAULT_MANIFEST_PATH);

  if (!isManifestExists) {
    return;
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(DEFAULT_MANIFEST_PATH, { encoding: 'utf8' }));

    if (!Array.isArray(manifest.actions) || manifest.actions.length === 0) {
      return;
    }

    console.log('');
    console.log(`  ----------------------------
  App actions manifest found in ${chalk.bold(DEFAULT_MANIFEST_PATH)}.
  ----------------------------`);
    console.log('');

    const actions = (manifest.actions as FunctionAppAction[]).map((action) => {
      const allowNetworks = Array.isArray(action.allowNetworks)
        ? action.allowNetworks.map(stripProtocol)
        : [];

      const hasInvalidNetwork = allowNetworks.find((netWork) => !isValidNetwork(netWork));
      if (hasInvalidNetwork) {
        console.log(
          `${chalk.red(
            'Error:',
          )} Invalid IP address ${hasInvalidNetwork} found in the allowNetworks array for action "${
            action.name
          }".`,
        );
        // eslint-disable-next-line no-process-exit
        process.exit(1);
      }

      // EntryFile is not used but we do want to strip it from action
      const { entryFile: _, ...actionWithoutEntryFile } = action;

      return {
        ...actionWithoutEntryFile,
        allowNetworks,
      };
    });

    return actions;
  } catch {
    console.log(
      `${chalk.red('Error:')} Invalid JSON in manifest file at ${chalk.bold(
        DEFAULT_MANIFEST_PATH,
      )}.`,
    );
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
}
