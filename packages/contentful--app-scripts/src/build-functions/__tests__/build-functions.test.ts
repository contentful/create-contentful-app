/* eslint-disable @typescript-eslint/no-var-requires */
import assert from 'assert';
import { type BuildFunctionsOptions } from '../../types';
import { resolveEsBuildConfig, validateFunctions } from '../build-functions';

function assertPartialObject(actual: any, expected: any) {
  for (const key in expected) {
    if (typeof expected[key] === 'object' && expected[key] !== null) {
      assertPartialObject(actual[key], expected[key]);
    } else {
      assert.equal(actual[key], expected[key]);
    }
  }
}

describe('resolveEsBuildConfig', () => {
  it('should resolve the default esbuild config if none is provided', async () => {
    const options: BuildFunctionsOptions = {};
    const manifest = require('./contentful-app-manifest.json');
    const esbuildConfig = await resolveEsBuildConfig(options, manifest, __dirname);
    assert.strictEqual(Boolean(esbuildConfig), true);
    assertPartialObject(esbuildConfig, {
      entryPoints: {
        'fixtures/function': `./fixtures/function.ts`,
      },
      bundle: true,
      outdir: 'build',
      format: 'esm',
      target: 'es2022',
      minify: true,
    });
  });
  
  it('should resolve the esbuild config at the provided path if present', async () => {
    const options: BuildFunctionsOptions = {
      esbuildConfig: 'esbuild.config.js',
    };
    const manifest = require('./contentful-app-manifest.json');
    const esbuildConfig = await resolveEsBuildConfig(options, manifest, __dirname);
    assert.strictEqual(Boolean(esbuildConfig), true);
    assertPartialObject(esbuildConfig, {
      entryPoints: {
        'my-func': './fixtures/function.ts',
      },
      bundle: false,
      outdir: 'dist',
      format: 'cjs',
      target: 'es2024',
      minify: false,
    });
  });
});

describe('validateFunctions', () => {
  const validManifest = {
    functions: [
      {
        id: 'an-id',
        name: 'myFunc',
        entryFile: 'index.ts',
        description: 'My function',
        accepts: ['appaction.call'],
      },
    ],
  };

  const deleteProp = (manifest: any, property: string) => {
    const { [property]: _, ...rest } = manifest;
    return rest;
  };
  it('should throw an error if the functions property is missing from the manifest', () => {
    const manifest = {};
    assert.throws(() => validateFunctions(manifest));
  });

  it('should throw an error if the functions property is not an array', () => {
    const manifest = { functions: {} };
    assert.throws(() => validateFunctions(manifest));
  });

  it('should throw an error if a function is missing a name', () => {
    const manifest = { ...validManifest };
    manifest.functions = manifest.functions.map((f) => deleteProp(f, 'name'));
    assert.throws(() => validateFunctions(manifest));
  });

  it('should throw an error if a function is missing an entryFile', () => {
    const manifest = { ...validManifest };
    manifest.functions = manifest.functions.map((f) => deleteProp(f, 'entryFile'));
    assert.throws(() => validateFunctions(manifest));
  });

  it('should throw an error if a function is missing a description', () => {
    const manifest = { ...validManifest };
    manifest.functions = manifest.functions.map((f) => deleteProp(f, 'description'));
    assert.throws(() => validateFunctions(manifest));
  });

  it('should throw an error if a function is missing an id', () => {
    const manifest = { ...validManifest };
    manifest.functions = manifest.functions.map((f) => deleteProp(f, 'id'));
    assert.throws(() => validateFunctions(manifest));
  });

  it('should throw an error if a function is missing an accepts', () => {
    const manifest = { ...validManifest };
    manifest.functions = manifest.functions.map((f) => deleteProp(f, 'accepts'));
    assert.throws(() => validateFunctions(manifest));
  });

  it('should throw an error if a function is missing a path', () => {
    const manifest = { ...validManifest };
    manifest.functions = manifest.functions.map((f) => deleteProp(f, 'path'));
    assert.throws(() => validateFunctions(manifest));
  });

  it('should not throw an error if all functions are valid', () => {
    const manifest = {
      functions: [
        {
          id: 'example',
          name: 'myFunc',
          entryFile: 'index.ts',
          description: 'My function',
          accepts: ['appaction.call'],
          path: 'path/to/file.ts',
        },
      ],
    };
    assert.doesNotThrow(() => validateFunctions(manifest));
  });
});
