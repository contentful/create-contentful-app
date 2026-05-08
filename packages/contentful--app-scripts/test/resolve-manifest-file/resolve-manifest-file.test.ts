import { assert } from "chai";
import { BuildFunctionsOptions } from "../../src/types";
import { resolveManifestFile } from "../../src/utils";

describe('resolveManifestFile', () => {
	it('should resolve the default manifest file if none is provided', async () => {
		const options: BuildFunctionsOptions = {};
		const manifest = await resolveManifestFile(options, __dirname);
		assert.strictEqual(Boolean(manifest), true);
		assert.strictEqual('functions' in manifest, true);
		assert.strictEqual(manifest.functions.length, 1);
		assert.strictEqual(manifest.functions[0].name, 'default');
	});

	it('should resolve the manifest file at the provided path if present', async () => {
		const options: BuildFunctionsOptions = {
			manifestFile: 'fixtures/another-contentful-app-manifest.json',
		};
		const manifest = await resolveManifestFile(options, __dirname);
		assert.strictEqual(Boolean(manifest), true);
		assert.strictEqual('functions' in manifest, true);
		assert.strictEqual(manifest.functions.length, 1);
		assert.strictEqual(manifest.functions[0].name, 'custom');
	});
});