import fs from 'fs';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { cacheEnvVars } from './cache-credential';
import { Definition } from './definition-api';
import { Organization } from './organization-api';
import { ContentfulFunction, FunctionAppAction } from './types';

const DEFAULT_MANIFEST_PATH = './contentful-app-manifest.json';

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

const logProgress = (message: string) => {
  console.log('');
  console.log(`  ----------------------------
  ${message}
  ----------------------------`);
  console.log('');
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
    logProgress(`${message}
      Using environment variable: ${cachedElement.name} (${chalk.blue(cachedElement.value)})`);
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

type Entities<Type> = Type extends 'actions' ? Omit<FunctionAppAction, 'entryFile'>[] : Omit<ContentfulFunction, 'entryFile'>[];

export function getEntityFromManifest<Type extends 'actions' | 'functions'>(type: Type): Entities<Type> | undefined {
  const isManifestExists = fs.existsSync(DEFAULT_MANIFEST_PATH);

  if (!isManifestExists) {
    return;
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(DEFAULT_MANIFEST_PATH, { encoding: 'utf8' }));

    if (!Array.isArray(manifest[type]) || manifest[type].length === 0) {
      return;
    }

    logProgress(
      `${type === 'actions' ? 'App Actions' : 'functions'} found in ${chalk.bold(
        DEFAULT_MANIFEST_PATH,
      )}.`,
    );

    const fieldMappingEvent = "graphql.field.mapping";
    const queryEvent =  "graphql.query";

    const items = (manifest[type] as FunctionAppAction[] | ContentfulFunction[]).map((item) => {
      const allowNetworks = Array.isArray(item.allowNetworks)
        ? item.allowNetworks.map(stripProtocol)
        : [];

      const accepts = 'accepts' in item ? Array.isArray(item.accepts) ? item.accepts : undefined : undefined;
      const hasInvalidEvent = accepts?.find((event) => ![fieldMappingEvent, queryEvent].includes(event));

      const hasInvalidNetwork = allowNetworks.find((netWork) => !isValidNetwork(netWork));
      if (hasInvalidNetwork) {
        console.log(
          `${chalk.red(
            'Error:',
          )} Invalid IP address ${hasInvalidNetwork} found in the allowNetworks array for ${type} "${
            item.name
          }".`,
        );
        // eslint-disable-next-line no-process-exit
        process.exit(1);
      }
      if (hasInvalidEvent) {
        console.log(
          `${chalk.red(
            'Error:',
          )} Invalid events ${hasInvalidEvent} found in the accepts array for ${type} "${
            item.name
          }".`,
        );
        // eslint-disable-next-line no-process-exit
        process.exit(1);
      }

      // EntryFile is not used but we do want to strip it
      // eslint-disable-next-line no-unused-vars
      const { entryFile: _, ...itemWithoutEntryFile } = item;

      return {
        ...itemWithoutEntryFile,
        ...(accepts !== undefined ? { accepts } : {}),
        allowNetworks,
      };
    });

    return items as Entities<Type>;
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
