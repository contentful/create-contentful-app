import { GenerateFunctionSettings } from "../types";
import { buildGenerateFunctionSettingsInteractive, buildGenerateFunctionSettingsCLI } from "./build-generate-function-settings";
import { create } from "./create-function";

const interactive = async () => {
  const generateFunctionSettings = await buildGenerateFunctionSettingsInteractive();

  return create(generateFunctionSettings);
};

const nonInteractive = async (options: GenerateFunctionSettings) => {
    const generateFunctionSettings = await buildGenerateFunctionSettingsCLI(options);
    return create(generateFunctionSettings);
};

export const generateFunction = {
  interactive,
  nonInteractive,
};
