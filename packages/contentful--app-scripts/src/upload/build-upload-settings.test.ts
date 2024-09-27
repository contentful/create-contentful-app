import assert from 'assert';
import sinon from 'sinon';
import inquirer from 'inquirer';

import { buildAppUploadSettings, hostProtocolFilter } from './build-upload-settings';

import * as getAppInfoModule from '../get-app-info';
import * as utilsModule from '../utils';

describe('buildAppUploadSettings', () => {
  let promptStub;
  let getAppInfoStub;
  let getEntityFromManifestStub;

  beforeEach(() => {
    promptStub = sinon.stub(inquirer, 'prompt');
    getAppInfoStub = sinon.stub(getAppInfoModule, 'getAppInfo');
    getEntityFromManifestStub = sinon.stub(utilsModule, 'getEntityFromManifest');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should strip protocol from host input when provided via prompt', async () => {
    const options = {};
    const prompts = {
      bundleDirectory: './custom-build',
      comment: 'Test comment',
      activateBundle: true,
      host: 'https://api.contentful.com',
    };

    // Manually apply the filter function to simulate inquirer's behavior
    prompts.host = hostProtocolFilter(prompts.host);

    promptStub.resolves(prompts);

    getAppInfoStub.resolves({ appId: '123', appName: 'Test App' });

    getEntityFromManifestStub.withArgs('actions').returns('actionsManifest');
    getEntityFromManifestStub.withArgs('functions').returns('functionsManifest');

    const result = await buildAppUploadSettings(options);

    assert.strictEqual(result.host, 'api.contentful.com', 'Protocol should be stripped from host');
    assert.strictEqual(result.bundleDirectory, './custom-build');
    assert.strictEqual(result.comment, 'Test comment');
    assert.strictEqual(result.skipActivation, false); // activateBundle is true, so skipActivation should be false
    assert.strictEqual(result.actions, 'actionsManifest');
    assert.strictEqual(result.functions, 'functionsManifest');
  });

  it('should prompt for missing options and use defaults', async () => {
    const options = {};
    const prompts = {
      bundleDirectory: './build',
      comment: '',
      activateBundle: true,
      host: 'api.contentful.com',
    };

    promptStub.resolves(prompts);
    getAppInfoStub.resolves({ appId: '123', appName: 'Test App' });
    getEntityFromManifestStub.withArgs('actions').returns('actionsManifest');
    getEntityFromManifestStub.withArgs('functions').returns('functionsManifest');

    const result = await buildAppUploadSettings(options);

    assert.strictEqual(result.bundleDirectory, './build');
    assert.strictEqual(result.comment, '');
    assert.strictEqual(result.skipActivation, false);
    assert.strictEqual(result.host, 'api.contentful.com');
  });

  it('should handle skipActivation correctly when option is provided', async () => {
    const options = {
      skipActivation: true,
    };

    promptStub.resolves({});
    getAppInfoStub.resolves({ appId: '123', appName: 'Test App' });
    getEntityFromManifestStub.withArgs('actions').returns('actionsManifest');
    getEntityFromManifestStub.withArgs('functions').returns('functionsManifest');

    const result = await buildAppUploadSettings(options);

    assert.strictEqual(result.skipActivation, true);
  });

  it('should correctly handle activateBundle prompt when skipActivation is undefined', async () => {
    const options = {};
    const prompts = {
      activateBundle: false,
      host: 'api.contentful.com',
    };

    promptStub.resolves(prompts);
    getAppInfoStub.resolves({ appId: '123', appName: 'Test App' });
    getEntityFromManifestStub.withArgs('actions').returns('actionsManifest');
    getEntityFromManifestStub.withArgs('functions').returns('functionsManifest');

    const result = await buildAppUploadSettings(options);

    assert.strictEqual(result.skipActivation, true);
  });
});
