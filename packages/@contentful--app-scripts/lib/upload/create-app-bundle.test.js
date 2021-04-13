const { stub, match } = require('sinon');
const assert = require('assert');
const proxyquire = require('proxyquire');

describe('createAppBundle', () => {
  let createAppBundleFromUpload, clientMock;
  const bundleMock = 'mocked_bundle';

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
    const bundle = await createAppBundleFromUpload(
      { accessToken: 'token', organisation: { value: 'id' }, definition: { value: 'id' } },
      'upload-id'
    );
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
