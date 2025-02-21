import { buildGenerateFunctionSettings } from "./build-function-settings";
import { create } from "./create-function";

const interactive = async () => {
  const generateFunctionSettings = await buildGenerateFunctionSettings();

  return create(generateFunctionSettings);
};

const nonInteractive = async () => {
    create
};

export const generateFunction = {
  interactive,
  nonInteractive,
};
