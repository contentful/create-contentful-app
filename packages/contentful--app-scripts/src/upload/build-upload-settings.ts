import { prompt } from 'inquirer';
import { getAppInfo } from '../get-app-info';
import { getEntityFromManifest } from '../utils';
import { DEFAULT_CONTENTFUL_API_HOST } from '../constants';
import { UploadOptions, UploadSettings } from '../types';

export async function buildAppUploadSettings(options: UploadOptions): Promise<UploadSettings> {
  const actionsManifest = getEntityFromManifest('actions');
  const functionManifest = getEntityFromManifest('functions');
  const prompts = [];
  const { bundleDir, comment, skipActivation, host } = options;

  if (! bundleDir) {
    prompts.push({
      name: 'bundleDirectory',
      message: `Bundle directory, if not default:`,
      default: './build',
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
    });
  }

  const { activateBundle, ...appUploadSettings } = await prompt(prompts);

  const appInfo = await getAppInfo(options);

  return {
    bundleDirectory: bundleDir,
    skipActivation: skipActivation === undefined ? !activateBundle : skipActivation,
    comment,
    host,
    actions: actionsManifest,
    functions: functionManifest,
    ...appUploadSettings,
    ...appInfo,
  };
}
