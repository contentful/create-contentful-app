import mergeOptions from 'merge-options';
import { readFile, writeFile, access } from 'fs/promises';
import { resolve } from 'path';

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
