import { resolve } from "path";
import { GenerateFunctionSettings } from "./build-function-settings";
import { cloneFunction } from "./clone";

export async function create(settings: GenerateFunctionSettings) {
  const localPath = resolve(process.cwd());
  await cloneFunction(localPath, settings);

  console.log(`Function "${settings.name}" created successfully`);
}