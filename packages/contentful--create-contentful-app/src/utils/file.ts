import mergeOptions from 'merge-options';
import { readFile, writeFile, access } from 'fs/promises';
import { resolve } from 'path';

async function getJsonData(path: string | undefined): Promise<Record<string, any> | undefined> {
  if (!path) {
    return undefined;
  }

  const normalizedPath = resolve(path);

  if (!(await exists(path))) {
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
  concatArrays?: boolean;
};

export async function mergeJsonIntoFile({
  source,
  destination,
  concatArrays = false,
  mergeFn = mergeOptions.bind({ concatArrays }),
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
