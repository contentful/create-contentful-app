const assert = require('assert');
const { stub, match } = require('sinon');
const proxyquire = require('proxyquire');
describe('createAppUpload', () => {
  let createAppUpload, clientMock;
  const uploadMock = { sys: { id: 'test-id' } };
  const mockSettings = {
    accessToken: 'token',
    organisation: { value: 'id' },
    definition: { value: 'id' },
  };
  beforeEach(() => {
    stub(console, 'log');
  });

  afterEach(() => {
    console.log.restore();
  });

  beforeEach(() => {
    clientMock = {
      getOrganization: () => ({
        createAppUpload: () => uploadMock,
      }),
    };

    ({ createAppUpload } = proxyquire('./create-app-upload', {
      'contentful-management': {
        createClient: () => {
          return clientMock;
        },
      },
      './create-zip-from-directory': { createZipFileFromDirectory: () => 'zip_file' },
    }));
  });

  it('successfully creates an app upload from settings', async () => {
    const appUpload = await createAppUpload(mockSettings);
    assert.strictEqual(appUpload, uploadMock);
  });
  it('shows creation error when createAppUpload throws', async () => {
    clientMock.getOrganization = () => ({
      createAppUpload: stub().rejects(new Error()),
    });
    await createAppUpload(mockSettings);

    assert(console.log.calledWith(match(/Creation error:/)));
  });
});
