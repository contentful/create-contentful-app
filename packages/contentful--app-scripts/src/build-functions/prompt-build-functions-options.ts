import { prompt } from 'inquirer';
import { DEFAULT_APP_MANIFEST_PATH } from '../constants';
import { type BuildFunctionsOptions } from '../types';

export async function promptBuildFunctionsOptions(
  options: BuildFunctionsOptions
): Promise<BuildFunctionsOptions> {
  const { manifestFile, watch, esbuildConfig } = options;
  const prompts = [];

  if (manifestFile === undefined) {
    prompts.push({
      type: 'string',
      name: 'manifestFile',
      message: `Path to your Contentful app manifest file (optional):`,
      default: DEFAULT_APP_MANIFEST_PATH,
    });
  }
  if (watch === undefined) {
    prompts.push({
      type: 'boolean',
      name: 'watch',
      message: `Re-build your function files on changes (optional):`,
      default: false,
    });
  }
  if (esbuildConfig === undefined) {
    prompts.push({
      type: 'string',
      name: 'esbuildConfig',
      message: `Path to your custom esbuild config file (optional):`,
    });
  }

  const buildFunctionsOptions = await prompt(prompts);

  return buildFunctionsOptions;
}
