import inquirer from 'inquirer';
import { getAppInfo } from '../get-app-info';
import { ActivateOptions, ActivateSettings } from '../types';

export async function buildBundleActivateSettings(
  options: ActivateOptions
): Promise<ActivateSettings> {
  const { bundleId, host } = options;
  const prompts = [];

  if (!bundleId) {
    prompts.push({
      name: 'bundleId',
      message: `The id of the bundle you want to activate (required):`,
      validate: (input: string) => input.length > 0,
    });
  }
  if (!host) {
    prompts.push({
      name: 'host',
      message: `Contentful CMA endpoint URL:`,
      default: 'api.contentful.com',
    });
  }

  const { host: interactiveHost, ...appActivateSettings } = await inquirer.prompt(prompts);
  const hostValue = host || interactiveHost;
  const appInfo = await getAppInfo({ ...options, host: hostValue });

  return {
    bundleId,
    host: hostValue,
    ...appActivateSettings,
    ...appInfo,
  };
}
