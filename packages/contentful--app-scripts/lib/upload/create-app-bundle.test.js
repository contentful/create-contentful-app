const { stub, match } = require('sinon');
const assert = require('assert');
const proxyquire = require('proxyquire');

const bundleMock = { sys: { id: 'mocked_bundle' } };
const mockedSettings = {
  accessToken: 'token',
  organization: { value: 'id' },
  definition: { value: 'id' },
};

describe('createAppBundleFromUpload', () => {
  // eslint-disable-next-line no-unused-vars
  let createAppBundleFromUpload, clientMock, createClientArgs;

  beforeEach(() => {
    stub(console, 'log');
  });

  afterEach(() => {
    console.log.restore();
  });

  beforeEach(() => {
    clientMock = {
      getOrganization: () => ({
        getAppDefinition: () => ({
          createAppBundle: () => bundleMock,
        }),
      }),
      getOrganizations: stub(),
    };

    ({ createAppBundleFromUpload } = proxyquire('./create-app-bundle', {
      'contentful-management': {
        createClient: (...args) => {
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
    clientMock.getOrganization = () => ({
      getAppDefinition: () => ({
        createAppBundle: stub().rejects(new Error()),
      }),
    });
    await createAppBundleFromUpload(mockedSettings, 'upload-id');

    assert(console.log.calledWith(match(/Creation error:/)));
  });
  it('supports custom defined host domain creating appbundle from upload', async () => {
    await createAppBundleFromUpload({ ...mockedSettings, host: 'jane.doe.com' });
    assert.strictEqual(createClientArgs[0].host, 'jane.doe.com');
  });
});

describe('createAppBundleFromSettings', () => {
  let createAppBundleFromSettings, clientMock, uploadMock, createClientArgs;

  beforeEach(() => {
    stub(console, 'log');
  });

  afterEach(() => {
    console.log.restore();
  });

  beforeEach(() => {
    clientMock = {
      getOrganization: () => ({
        getAppDefinition: () => ({
          createAppBundle: () => bundleMock,
        }),
      }),
      getOrganizations: stub(),
    };

    uploadMock = { sys: { id: 'test-id' } };

    ({ createAppBundleFromSettings } = proxyquire('./create-app-bundle', {
      'contentful-management': {
        createClient: (...args) => {
          createClientArgs = args;
          return clientMock;
        },
      },
      './create-app-upload': { createAppUpload: () => uploadMock },
    }));
  });
  it('creates app bundle', async () => {
    await createAppBundleFromSettings(mockedSettings);
    assert(console.log.calledWith(match(/Your files were successfully uploaded/)));
    assert(console.log.calledWith(match(/Created a new app bundle/)));
  });
  it('shows creation error when app upload did not succeed', async () => {
    uploadMock = stub().rejects(new Error())();
    await createAppBundleFromSettings(mockedSettings);
    assert(console.log.calledWith(match(/Creation error:/)));
  });
  it('supports custom defined host domain creating appbundle from settings', async () => {
    await createAppBundleFromSettings({ ...mockedSettings, host: 'jane.doe.com' });
    assert.strictEqual(createClientArgs[0].host, 'jane.doe.com');
  });
});
