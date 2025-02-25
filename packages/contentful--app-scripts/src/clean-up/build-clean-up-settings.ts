import { prompt } from 'inquirer';
import { DEFAULT_BUNDLES_TO_KEEP, DEFAULT_CONTENTFUL_API_HOST } from '../constants';
import { getAppInfo } from '../get-app-info';
import { CleanupOptions, CleanupSettings } from '../types';

export async function buildCleanUpSettings(options: CleanupOptions): Promise<CleanupSettings> {
  const { keep, host } = options;
  const prompts = [];

  if (keep === undefined) {
    prompts.push({
      type: 'number',
      name: 'keep',
      message: `The amount of newest bundles to keep:`,
      default: DEFAULT_BUNDLES_TO_KEEP,
    });
  }
  if (!host) {
    prompts.push({
      name: 'host',
      message: `Contentful CMA endpoint URL:`,
      default: DEFAULT_CONTENTFUL_API_HOST,
    });
  }

  const { host: interactiveHost, ...appCleanUpSettings } = await prompt(prompts);
  const hostValue = host || interactiveHost;
  const appInfo = await getAppInfo({ ...options, host: hostValue });

  return {
    keep: keep === undefined ? +appCleanUpSettings.keep : +keep,
    host: hostValue,
    ...appCleanUpSettings,
    ...appInfo,
  };
}
