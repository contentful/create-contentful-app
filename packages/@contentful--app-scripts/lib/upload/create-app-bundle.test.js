const { stub, match } = require('sinon');
const assert = require('assert');
const proxyquire = require('proxyquire');

const bundleMock = { sys: { id: 'mocked_bundle' } };
const mockSettings = {
  accessToken: 'token',
  organisation: { value: 'id' },
  definition: { value: 'id' },
};

describe('createAppBundleFromUpload', () => {
  let createAppBundleFromUpload, clientMock;

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
        createClient: () => {
          return clientMock;
        },
      },
    }));
  });
  it('creates app bundle', async () => {
    const bundle = await createAppBundleFromUpload(mockSettings, 'upload-id');
    assert.strictEqual(bundle, bundleMock);
  });
  it('shows creation error when createAppBundle throws', async () => {
    clientMock.getOrganization = () => ({
      getAppDefinition: () => ({
        createAppBundle: stub().rejects(new Error()),
      }),
    });
    await createAppBundleFromUpload(
      { accessToken: 'token', organisation: { value: 'id' }, definition: { value: 'id' } },
      'upload-id'
    );

    assert(console.log.calledWith(match(/Creation error:/)));
  });
});

describe('createAppBundleFromSettings', () => {
  let createAppBundleFromSettings, clientMock, uploadMock;

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
        createClient: () => {
          return clientMock;
        },
      },
      './create-app-upload': { createAppUpload: () => uploadMock },
    }));
  });
  it('creates app bundle', async () => {
    await createAppBundleFromSettings(mockSettings);
    assert(console.log.calledWith(match(/Your files were successfully uploaded/)));
    assert(console.log.calledWith(match(/Created a new app bundle/)));
  });
  it('shows creation error when app upload did not succeed', async () => {
    uploadMock = stub().rejects(new Error())();
    await createAppBundleFromSettings(mockSettings);
    assert(console.log.calledWith(match(/Creation error:/)));
  });
});
