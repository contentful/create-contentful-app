import { prompt } from 'inquirer';
import { getAppInfo } from '../get-app-info';
import { getFunctionsFromManifest } from '../utils';
import { DEFAULT_CONTENTFUL_API_HOST } from '../constants';
import { UploadOptions, UploadSettings } from '../types';
import path from 'node:path';

export async function buildAppUploadSettings(options: UploadOptions): Promise<UploadSettings> {
  const functionManifest = getFunctionsFromManifest();
  const prompts = [];
  const { bundleDir, comment, skipActivation, host } = options;

  if (!bundleDir) {
    prompts.push({
      name: 'bundleDirectory',
      message: `Bundle directory, if not default:`,
      default: path.resolve('.', 'build'),
    });
  }
  if (!comment) {
    prompts.push({
      name: 'comment',
      message: `Add a comment to the created bundle:`,
      default: '',
    });
  }
  if (skipActivation === undefined) {
    prompts.push({
      type: 'confirm',
      name: 'activateBundle',
      message: `Do you want to activate the bundle after upload?`,
      default: true,
    });
  }
  if (!host) {
    prompts.push({
      name: 'host',
      message: `Contentful CMA endpoint URL:`,
      default: DEFAULT_CONTENTFUL_API_HOST,
      filter: hostProtocolFilter,
    });
  }

  const { activateBundle, host: interactiveHost, ...appUploadSettings } = await prompt(prompts);
  const hostValue = host || interactiveHost;
  const appInfo = await getAppInfo({ ...options, host: hostValue });

  return {
    bundleDirectory: bundleDir,
    skipActivation: skipActivation === undefined ? !activateBundle : skipActivation,
    comment,
    host: hostValue,
    functions: functionManifest,
    ...appUploadSettings,
    ...appInfo,
  };
}

export function hostProtocolFilter(input: string) {
  return input.replace(/^https?:\/\//, '');
}
