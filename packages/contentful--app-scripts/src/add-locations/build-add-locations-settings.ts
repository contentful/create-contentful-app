import chalk from 'chalk';
import { prompt } from 'inquirer';
import { getAppInfo } from '../get-app-info';
import { DEFAULT_CONTENTFUL_API_HOST } from '../constants';
import { AddLocationsOptions, AddLocationsSettings } from '../types';
import { pageNavLinkNamePrompt, pageNavLinkPathPrompt, pageNavPrompt, selectFieldsPrompt, selectLocationsPrompt } from '../location-prompts';

export async function buildAddLocationsSettings(options: AddLocationsOptions): Promise<AddLocationsSettings> {
  const appPrompts = [];
  const { host } = options;
  if (!host) {
    appPrompts.push({
      name: 'host',
      message: `Contentful CMA endpoint URL:`,
      default: DEFAULT_CONTENTFUL_API_HOST,
      filter: hostProtocolFilter,
    });
  }

  const { host: interactiveHost } = await prompt(appPrompts);
  const hostValue = host || interactiveHost;
  const appInfo = await getAppInfo({ ...options, host: hostValue });

  const locationPrompts = [];
  const currentLocations = new Set(appInfo.definition.locations);
  const possibleLocations = selectLocationsPrompt.choices.filter((locationChoice) => !currentLocations.has(locationChoice.value));

  if (possibleLocations.length === 0) {
    console.log(`${chalk.red('No locations to add')}`);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
  if (possibleLocations.length > 0) {
    locationPrompts.push({
        ...selectLocationsPrompt,
        choices: possibleLocations,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validate(input: any) {
          if (input.length < 1) {
            return 'You must choose at least one location to add.';
          }
          return true;
        },
    });

    if (possibleLocations.some((location) => location.value === 'entry-field')) {
      locationPrompts.push({ ...selectFieldsPrompt })
    }
    if (possibleLocations.some((location) => location.value === 'page')) {
      locationPrompts.push({ ...pageNavPrompt })
      locationPrompts.push({ ...pageNavLinkNamePrompt })
      locationPrompts.push({ ...pageNavLinkPathPrompt })
    }
  }
  
  const addLocationSettings = await prompt(locationPrompts);
  return {
    host: hostValue,
    ...addLocationSettings,
    ...appInfo,
  };
}

export function hostProtocolFilter(input: string) {
  return input.replace(/^https?:\/\//, '');
}
