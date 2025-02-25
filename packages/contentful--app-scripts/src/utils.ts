import fs from 'fs';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { cacheEnvVars } from './cache-credential';
import { Definition } from './definition-api';
import { Organization } from './organization-api';
import { ContentfulFunction } from './types';
import { DEFAULT_CONTENTFUL_APP_HOST } from './constants';
import { resolve } from 'node:path';

const DEFAULT_MANIFEST_PATH = './contentful-app-manifest.json';

const functionEvents = {
  appActionCall: 'appaction.call',
  appEventFilter: 'appevent.filter',
  appEventHandler: 'appevent.handler',
  appEventTransformation: 'appevent.transformation',
  fieldMappingEvent: 'graphql.field.mapping',
  resourceTypeMappingEvent: 'graphql.resourcetype.mapping',
  queryEvent: 'graphql.query',
  resourceLinksSearchEvent: 'resources.search',
  resourceLinksLookupEvent: 'resources.lookup',
};

export const throwValidationException = (subject: string, message?: string, details?: string) => {
  console.log(`${chalk.red('Validation Error:')} Missing or invalid ${subject}.`);
  message && console.log(message);
  details && console.log(`${chalk.dim(details)}`);

  throw new TypeError(message);
};

export const isValidNetwork = (address: string): boolean => {
  // Regular expression to validate network addresses
  const addressRegex = new RegExp(
    '^(?:' + // Start of the non-capturing group for the entire address
      '(?:' + // Start of the non-capturing group for domain names
      '(?:\\*\\.)' + // Matches wildcard domains like *.example.com
      '(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)' + // Matches a single subdomain
      '[a-zA-Z]{2,6}' + // Matches the top-level domain (TLD)
      '|' + // OR
      '(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+' + // Matches standard domains with one or more subdomains
      '[a-zA-Z]{2,6}' + // Matches the top-level domain (TLD)
      ')|' + // End of the non-capturing group for domain names, OR
      '(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}' + // Matches the first three octets of an IPv4 address
      '(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|' + // Matches the last octet of an IPv4 address
      '(\\[(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}\\]' + // Matches IPv6 addresses in square brackets
      '|(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4})' + // Matches IPv6 addresses without square brackets
      ')(?::\\d{1,5})?$' // Matches an optional port number (1 to 5 digits)
  );
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

export const selectFromList = async <T extends Definition | Organization>(
  list: T[],
  message: string,
  cachedOptionEnvVar: string
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

export function getFunctionsFromManifest(): Omit<ContentfulFunction, 'entryFile'>[] | undefined {
  const isManifestExists = fs.existsSync(DEFAULT_MANIFEST_PATH);

  if (!isManifestExists) {
    return;
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(DEFAULT_MANIFEST_PATH, { encoding: 'utf8' }));

    if (!Array.isArray(manifest['functions']) || manifest['functions'].length === 0) {
      return;
    }

    logProgress(
      `functions found in ${chalk.bold(
        DEFAULT_MANIFEST_PATH
      )}.`
    );

    const items = (manifest['functions'] as ContentfulFunction[]).map((item) => {
      const allowNetworks = Array.isArray(item.allowNetworks)
        ? item.allowNetworks.map(stripProtocol)
        : [];

      const accepts = 'accepts' in item && Array.isArray(item.accepts) ? item.accepts : undefined;
      const hasInvalidEvent = accepts?.some(
        (event) => !Object.values(functionEvents).includes(event)
      );

      const hasInvalidNetwork = allowNetworks.find((netWork) => !isValidNetwork(netWork));
      if (hasInvalidNetwork) {
        console.log(
          `${chalk.red(
            'Error:'
          )} Invalid IP address ${hasInvalidNetwork} found in the allowNetworks array for Function "${
            item.name
          }".`
        );
        // eslint-disable-next-line no-process-exit
        process.exit(1);
      }
      if (hasInvalidEvent) {
        console.log(
          `${chalk.red('Error:')} Invalid events found in the accepts array for Function "${
            item.name
          }".`
        );
        // eslint-disable-next-line no-process-exit
        process.exit(1);
      }

      // EntryFile is not used but we do want to strip it
      // eslint-disable-next-line no-unused-vars
      const { entryFile: _, ...itemWithoutEntryFile } = item;

      return {
        ...itemWithoutEntryFile,
        ...(accepts && { accepts }),
        allowNetworks,
      };
    });

    return items;
  } catch {
    console.log(
      `${chalk.red('Error:')} Invalid JSON in manifest file at ${chalk.bold(
        DEFAULT_MANIFEST_PATH
      )}.`
    );
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
}

export function getWebAppHostname(host: string | undefined): string {
  return host && host.includes('api') ? host.replace('api', 'app') : DEFAULT_CONTENTFUL_APP_HOST;
}

export const resolveManifestFile = (options: { manifestFile?: string }, cwd = process.cwd()) => {
  return require(options.manifestFile
    ? resolve(cwd, options.manifestFile)
    : resolve(cwd, 'contentful-app-manifest.json'));
};

export const ID_REGEX = /^[a-zA-Z0-9]+$/;
