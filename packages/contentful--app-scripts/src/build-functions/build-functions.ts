/* eslint-disable @typescript-eslint/no-var-requires */
import esbuild from 'esbuild';
import path, { join, parse, resolve } from 'node:path';
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
 * Returns a map of function file names to their entry file paths, resolved with POSIX style paths expected by esbuild.
 */
const getEntryPoints = (
  manifest: { functions: ContentfulFunctionToBuild[] },
  cwd = process.cwd()
) => {
  return manifest.functions.reduce(
    (result: Record<string, string>, contentfulFunction: ContentfulFunctionToBuild) => {
      const fileProperties = path.posix.parse(contentfulFunction.path);
      const fileName = path.posix.join(fileProperties.dir, fileProperties.name);

      result[fileName] = path.posix.resolve(cwd, contentfulFunction.entryFile);

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
    // Parse the config path into its components
    const esbuildConfigProperties = parse(options.esbuildConfig);
    // Get the directory, defaulting to cwd if empty
    const dir = esbuildConfigProperties.dir === '' ? cwd : esbuildConfigProperties.dir;
    
    // Create an absolute path using the platform-specific join
    const absolutePath = resolve(dir, esbuildConfigProperties.base);
    
    // Convert the absolute path to a module path that require() can use
    // On Windows, this means:
    // 1. Convert C:\path\to\file.js to C:/path/to/file.js
    // 2. Handle UNC paths if present
    const modulePath = absolutePath.split(path.sep).join('/');
    
    return require(modulePath);
  }
  
  return {
    entryPoints: getEntryPoints(manifest, cwd),
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
