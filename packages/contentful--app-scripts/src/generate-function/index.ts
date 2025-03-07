import { GenerateFunctionSettings } from "../types";
import { buildGenerateFunctionSettingsInteractive, buildGenerateFunctionSettingsCLI } from "./build-generate-function-settings";
import { create } from "./create-function";
import { ValidationError } from "./types";

const interactive = async () => {
  try {
    const generateFunctionSettings = await buildGenerateFunctionSettingsInteractive();
    return create(generateFunctionSettings);
  } catch (e) {
    if (e instanceof ValidationError) {
      console.error(e.message)
    } else {
      console.error(e)
    }
  }
};

const nonInteractive = async (options: GenerateFunctionSettings) => {
  try {
    const generateFunctionSettings = await buildGenerateFunctionSettingsCLI(options);
    return create(generateFunctionSettings);
  } catch (e) {
    if (e instanceof ValidationError) {
      console.error(e.message)
    } else {
      console.error(e)
    }
  }
};

export const generateFunction = {
  interactive,
  nonInteractive,
};
