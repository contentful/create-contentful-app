import { buildFunctions as runBuild } from './build-functions';
import { promptBuildFunctionsOptions } from './prompt-build-functions-options';
import { type BuildFunctionsOptions } from '../types';

const interactive = async (options: BuildFunctionsOptions) => {
  const opts = await promptBuildFunctionsOptions(options);
  await runBuild(opts);
};

const nonInteractive = runBuild;

export const buildFunctions = {
  interactive,
  nonInteractive,
};
