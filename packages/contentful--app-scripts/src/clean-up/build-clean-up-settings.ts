import { prompt } from 'inquirer';
import { DEFAULT_BUNDLES_TO_KEEP, DEFAULT_CONTENTFUL_API_HOST } from '../../utils/constants';
import { getAppInfo } from '../get-app-info';
import { CleanupSettings } from '.';

export async function buildCleanUpSettings(
  options: Record<string, string | number>,
): Promise<CleanupSettings> {
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

  const appCleanUpSettings = await prompt(prompts);
  const appInfo = await getAppInfo(options);

  return {
    keep: +keep,
    host,
    ...appCleanUpSettings,
    ...appInfo,
  };
}
