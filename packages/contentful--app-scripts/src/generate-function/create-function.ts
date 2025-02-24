import { resolve } from "path";
import { cloneFunction } from "./clone";
import { GenerateFunctionSettings } from "../types";

export async function create(settings: GenerateFunctionSettings) {
  const localPath = resolve(process.cwd());
  await cloneFunction(localPath, settings);

  console.log(`Function "${settings.name}" created successfully`);
}