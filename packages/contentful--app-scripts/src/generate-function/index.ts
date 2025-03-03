import { GenerateFunctionOptions } from "../types";
import { buildGenerateFunctionSettings, buildGenerateFunctionSettingsFromOptions } from "./build-generate-function-settings";
import { create } from "./create-function";

const interactive = async () => {
  const generateFunctionSettings = await buildGenerateFunctionSettings();
  console.debug('generateFunctionSettings', generateFunctionSettings);
  return create(generateFunctionSettings);
};

const nonInteractive = async (options: GenerateFunctionOptions) => {
    const generateFunctionSettings = await buildGenerateFunctionSettingsFromOptions(options);
    console.debug('generateFunctionSettings', generateFunctionSettings);
    return create(generateFunctionSettings);
};

export const generateFunction = {
  interactive,
  nonInteractive,
};
