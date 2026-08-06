import assert from 'assert';
import sinon, { SinonStub } from 'sinon';
import proxyquire from 'proxyquire';

import * as getAppInfoModule from '../get-app-info';
import * as utilsModule from '../utils';
import { UploadOptions } from '../types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const storageEnabledManifest = require('../manifest/__fixtures__/storage-poc.json');

describe('getUploadSettingsArgs', () => {
  let getAppInfoStub: SinonStub;
  let getFunctionsFromManifestStub: SinonStub;
  let getStorageFromManifestStub: SinonStub;
  let getUploadSettingsArgs: (options: UploadOptions) => Promise<any>;

  const validOptions: UploadOptions = {
    definitionId: 'defId',
    organizationId: 'orgId',
    bundleDir: './build',
    token: 'test-token',
  };

  beforeEach(() => {
    getAppInfoStub = sinon.stub(getAppInfoModule, 'getAppInfo');
    getFunctionsFromManifestStub = sinon.stub(utilsModule, 'getFunctionsFromManifest');
    getStorageFromManifestStub = sinon.stub(utilsModule, 'getStorageFromManifest');

    ({ getUploadSettingsArgs } = proxyquire('./get-upload-settings-args', {
      ora: () => ({
        start: () => ({ stop: sinon.stub() }),
      }),
    }));
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return upload settings for valid options', async () => {
    getAppInfoStub.resolves({ appId: '123', appName: 'Test App' });
    getFunctionsFromManifestStub.returns('functionsManifest');

    const result = await getUploadSettingsArgs(validOptions);

    assert.strictEqual(result.bundleDirectory, './build');
    assert.strictEqual(result.functions, 'functionsManifest');
  });

  it('retains the same storageDeclaration object as storage upload settings', async () => {
    getAppInfoStub.resolves({ appId: '123', appName: 'Test App' });
    getFunctionsFromManifestStub.returns('functionsManifest');
    getStorageFromManifestStub.returns(storageEnabledManifest.storage);

    const result = await getUploadSettingsArgs(validOptions);

    assert.deepEqual(result.storage, storageEnabledManifest.storage);
  });

  it('returns undefined storage upload settings when the manifest has no storage declaration', async () => {
    getAppInfoStub.resolves({ appId: '123', appName: 'Test App' });
    getFunctionsFromManifestStub.returns('functionsManifest');
    getStorageFromManifestStub.returns(undefined);

    const result = await getUploadSettingsArgs(validOptions);

    assert.strictEqual(result.storage, undefined);
  });
});
