import { GenerateFunctionOptions } from "../types";
import { buildGenerateFunctionSettings, buildGenerateFunctionSettingsFromOptions } from "./build-generate-function-settings";
import { create } from "./create-function";

const interactive = async () => {
  const generateFunctionSettings = await buildGenerateFunctionSettings();
  return create(generateFunctionSettings);
};

const nonInteractive = async (options: GenerateFunctionOptions) => {
    const generateFunctionSettings = await buildGenerateFunctionSettingsFromOptions(options);
    return create(generateFunctionSettings);
};

export const generateFunction = {
  interactive,
  nonInteractive,
};
