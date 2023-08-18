import assert from 'assert';
import { stub, match, SinonStub } from 'sinon';
import proxyquire from 'proxyquire';
import { AppUpload, ClientAPI } from 'contentful-management';
import { UploadSettings } from '.';

describe('createAppUpload', () => {
  let createAppUpload: (settings: UploadSettings) => Promise<AppUpload | null | undefined>,
    clientMock: ClientAPI;
  const uploadMock = { sys: { id: 'test-id' } };
  const mockedSettings = {
    accessToken: 'token',
    organization: { value: 'id' },
    definition: { value: 'id' },
  } as UploadSettings;
  beforeEach(() => {
    stub(console, 'log');
  });

  afterEach(() => {
    (console.log as SinonStub).restore();
  });

  beforeEach(() => {
    clientMock = {
      getOrganization: () => ({
        createAppUpload: () => uploadMock,
      }),
    } as unknown as ClientAPI;

    ({ createAppUpload } = proxyquire('./create-app-upload', {
      'contentful-management': {
        createClient: () => {
          return clientMock;
        },
      },
      './create-zip-from-directory': { createZipFileFromDirectory: () => 'zip_file' },
      './validate-bundle': { validateBundle: () => {} },
    }));
  });

  it('successfully creates an app upload from settings', async () => {
    const appUpload = await createAppUpload(mockedSettings);
    assert.strictEqual(appUpload, uploadMock);
  });
  it('shows creation error when createAppUpload throws', async () => {
    clientMock = {
      getOrganization: () => ({
        createAppUpload: stub().rejects(new Error()),
      }),
    } as unknown as ClientAPI;
    await createAppUpload(mockedSettings);

    assert((console.log as SinonStub).calledWith(match(/Creation error:/)));
  });
});
