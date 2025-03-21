import mergeOptions from 'merge-options';
import { readFile, writeFile, access } from 'fs/promises';
import { join, resolve } from 'node:path';

export async function getJsonData(
  path: string | undefined,
): Promise<Record<string, any> | undefined> {
  if (!path) {
    return undefined;
  }

  const normalizedPath = resolve(path);

  if (!(await exists(normalizedPath))) {
    return undefined;
  }

  return JSON.parse(await readFile(normalizedPath, { encoding: 'utf-8' }));
}

export type MergeJsonIntoFileOptions = {
  destination: string;
  source?: string;
  mergeFn?: (
    destinationJson?: Record<string, any>,
    sourceJson?: Record<string, any>,
  ) => Record<string, any>;
};

export async function mergeJsonIntoFile({
  source,
  destination,
  mergeFn = mergeOptions.bind({ concatArrays: false }),
}: MergeJsonIntoFileOptions): Promise<void> {
  const sourceJson = await getJsonData(source);
  const destinationJson = await getJsonData(destination);

  const mergedJson = mergeFn(destinationJson, sourceJson);

  await writeFile(resolve(destination), JSON.stringify(mergedJson, null, '  '));
}

export function exists(path: string): Promise<boolean> {
  return access(path)
    .then(() => true)
    .catch(() => false);
}

/**
 * Check a directory if two files exist, returning the first one that exists or "None"
 * @param basePath Base path
 * @param paths List of paths, in order of preference
 * @returns First subpath if it exists, otherwise the second if it exists, otherwise "None"
 */
export async function whichExists(basePath: string, paths: string[]): Promise<string> {
    for (const path of paths) {
        try {
            await access(join(basePath, path));
            return path;
        } catch (error) {
            // Ignore and continue checking the next path
        }
    }
    return "None";
}
