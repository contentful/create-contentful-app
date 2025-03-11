/* eslint-disable @typescript-eslint/no-var-requires */
import esbuild from 'esbuild';
import path, { join, parse, relative, resolve } from 'node:path';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { type BuildFunctionsOptions, type ContentfulFunction } from '../types';
import { z } from 'zod';
import { ID_REGEX, resolveManifestFile } from '../utils';

type ContentfulFunctionToBuild = Omit<ContentfulFunction, 'entryFile'> & { entryFile: string };

const functionManifestSchema = z
  .object({
    functions: z.array(
      z
        .object({
          id: z.string().regex(ID_REGEX, 'Invalid "id" (must only contain alphanumeric characters)'),
          name: z.string(),
          description: z.string(),
          path: z.string(),
          entryFile: z.string(),
          accepts: z.array(z.string()),
        }, {

        })
        .required()
    ),
  })
  .required();

export const validateFunctions = (manifest: Record<string, any>) => {
  const validationResult = functionManifestSchema.safeParse(manifest);
  if (!validationResult.success) {
    throw new Error(
      `Invalid Contentful Function manifest: ${JSON.stringify(validationResult.error.issues)}`
    );
  }

  const uniqueValues = new Set();
  validationResult.data.functions.forEach((contentfulFunction: ContentfulFunctionToBuild) => {
    const { id, path, entryFile, accepts } = contentfulFunction;

    if (uniqueValues.has(id)) {
      throw new Error(`Duplicate function id: '${id}'`);
    }
    if (uniqueValues.has(path)) {
      throw new Error(`Duplicate function path: '${path}'`);
    }
    if (uniqueValues.has(entryFile)) {
      throw new Error(`Duplicate entryFile path: '${entryFile}'`);
    }

    uniqueValues.add(entryFile);
    uniqueValues.add(path);
    uniqueValues.add(id);

    const acceptsSet = new Set(accepts);
    if (acceptsSet.size !== accepts.length) {
      throw new Error(`Duplicate values found in 'accepts' for function with id '${id}'.`);
    }

    // Validate POSIX style paths
    if (path.includes('\\')) {
      throw new Error(`Function path must use POSIX style forward slashes, got: '${path}'`);
    }
    if (entryFile.includes('\\')) {
      throw new Error(`Function entryFile must use POSIX style forward slashes, got: '${entryFile}'`);
    }
  });
};

/**
 * Build the esbuild config `entryPoints` object from the functions manifest.
 * Uses posix style paths for consistency with the app manifest.
 */
const getEntryPoints = (
  manifest: { functions: ContentfulFunctionToBuild[] },
) => {
  return manifest.functions.reduce(
    (result: Record<string, string>, contentfulFunction: ContentfulFunctionToBuild) => {
      const fileProperties = path.posix.parse(contentfulFunction.entryFile);
      const buildAlias = path.posix.join(fileProperties.dir, fileProperties.name);

      const resolvedPath = path.posix.resolve('.', contentfulFunction.entryFile);
      let relativePath = path.posix.relative('.', resolvedPath)
      if (!relativePath.startsWith('.')) {
        relativePath = `./${relativePath}`;
      }
      result[buildAlias] = relativePath;

      return result;
    },
    {}
  );
};

export const resolveEsBuildConfig = (
  options: BuildFunctionsOptions,
  manifest: { functions: ContentfulFunctionToBuild[] },
  cwd = process.cwd()
) => {
  if (options.esbuildConfig) {
    const esbuildConfigFileProperties = parse(options.esbuildConfig);
    const dir = esbuildConfigFileProperties.dir === '' ? cwd : esbuildConfigFileProperties.dir;
    const absolutePath = resolve(dir, esbuildConfigFileProperties.base);
    const relativePath = relative(__dirname, absolutePath);

    // Convert the relative path to a module path that require() can use
    // On Windows, this means convert ..\path\to\file.js to ../path/to/file.js
    let modulePath = relativePath.replaceAll("\\", '/');
    if (!modulePath.startsWith('./')) {
      modulePath = `./${modulePath}`;
    }

    return require(modulePath);
  }

  return {
    entryPoints: getEntryPoints(manifest),
    bundle: true,
    outdir: 'build',
    format: 'esm',
    target: 'es2022',
    minify: true,
    define: {
      global: 'globalThis',
    },
    plugins: [NodeModulesPolyfillPlugin(), NodeGlobalsPolyfillPlugin()],
    logLevel: 'info',
  };
};

export async function buildFunctions(options: BuildFunctionsOptions) {
  const manifest = resolveManifestFile(options);

  try {
    console.log('Building functions');
    validateFunctions(manifest);

    const esbuildConfig = resolveEsBuildConfig(options, manifest);

    if (options.watch) {
      const context = await esbuild.context(esbuildConfig);
      await context.watch();
    } else {
      await esbuild.build(esbuildConfig);
    }
    return;
  } catch (e) {
    const error = e as Error;
    error.message = `Error building functions: ${(e as Error).message}`;
    console.error(error.message);
    throw Error(error.message, { cause: error.cause });
  }
}
