import { stub, match, SinonStub } from 'sinon';
import assert from 'assert';
import proxyquire from 'proxyquire';
import { AppUpload, ClientAPI } from 'contentful-management';
import { UploadSettings } from '.';

const bundleMock = { sys: { id: 'mocked_bundle' } };
const mockedSettings = {
  accessToken: 'token',
  organization: { value: 'id' },
  definition: { value: 'id' },
} as UploadSettings;

describe('createAppBundleFromUpload', () => {
  let createAppBundleFromUpload: typeof import('./create-app-bundle').createAppBundleFromUpload,
    clientMock: ClientAPI,
    createClientArgs: any[];

  beforeEach(() => {
    stub(console, 'log');
  });

  afterEach(() => {
    (console.log as SinonStub).restore();
  });

  beforeEach(() => {
    clientMock = {
      getOrganization: () => ({
        getAppDefinition: () => ({
          createAppBundle: () => bundleMock,
        }),
      }),
      getOrganizations: stub(),
    } as unknown as ClientAPI;

    ({ createAppBundleFromUpload } = proxyquire('./create-app-bundle', {
      'contentful-management': {
        createClient: (...args: any[]) => {
          createClientArgs = args;
          return clientMock;
        },
      },
    }));
  });
  it('creates app bundle', async () => {
    const bundle = await createAppBundleFromUpload(mockedSettings, 'upload-id');
    assert.strictEqual(bundle, bundleMock);
  });
  it('shows creation error when createAppBundle throws', async () => {
    clientMock = {
      getOrganization: () => ({
        getAppDefinition: () => ({
          createAppBundle: stub().rejects(new Error()),
        }),
      }),
    } as unknown as ClientAPI;
    await createAppBundleFromUpload(mockedSettings, 'upload-id');

    assert((console.log as SinonStub).calledWith(match(/Creation error:/)));
  });
  it('supports custom defined host domain creating appbundle from upload', async () => {
    await createAppBundleFromUpload({ ...mockedSettings, host: 'jane.doe.com' }, 'upload-id');
    assert.strictEqual(createClientArgs[0].host, 'jane.doe.com');
  });
});

describe('createAppBundleFromSettings', () => {
  let createAppBundleFromSettings: typeof import('./create-app-bundle').createAppBundleFromSettings,
    clientMock: ClientAPI,
    uploadMock: AppUpload,
    createClientArgs: any[];

  beforeEach(() => {
    stub(console, 'log');
  });

  afterEach(() => {
    (console.log as SinonStub).restore();
  });

  beforeEach(() => {
    clientMock = {
      getOrganization: () => ({
        getAppDefinition: () => ({
          createAppBundle: () => bundleMock,
        }),
      }),
      getOrganizations: stub(),
    } as unknown as ClientAPI;

    uploadMock = { sys: { id: 'test-id' } } as AppUpload;

    ({ createAppBundleFromSettings } = proxyquire('./create-app-bundle', {
      'contentful-management': {
        createClient: (...args: any[]) => {
          createClientArgs = args;
          return clientMock;
        },
      },
      './create-app-upload': { createAppUpload: () => uploadMock },
    }));
  });
  it('creates app bundle', async () => {
    await createAppBundleFromSettings(mockedSettings);
    assert((console.log as SinonStub).calledWith(match(/Your files were successfully uploaded/)));
    assert((console.log as SinonStub).calledWith(match(/Created a new app bundle/)));
  });
  it('shows creation error when app upload did not succeed', async () => {
    uploadMock = stub().rejects(new Error())();
    await createAppBundleFromSettings(mockedSettings);
    assert((console.log as SinonStub).calledWith(match(/Creation error:/)));
  });
  it('supports custom defined host domain creating appbundle from settings', async () => {
    await createAppBundleFromSettings({ ...mockedSettings, host: 'jane.doe.com' });
    assert.strictEqual(createClientArgs[0].host, 'jane.doe.com');
  });
});
