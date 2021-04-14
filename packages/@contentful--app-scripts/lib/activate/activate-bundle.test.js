const { stub, match } = require('sinon');
const assert = require('assert');
const proxyquire = require('proxyquire');

const mockedSettings = {
  accessToken: 'token',
  organization: { value: 'id' },
  definition: { value: 'id' },
  bundleId: 'bundle-id',
};

describe('activate-bundle', () => {
  let activateBundle, clientMock;
  beforeEach(() => {
    stub(console, 'log');
  });

  afterEach(() => {
    console.log.restore();
  });

  const updateStub = stub();
  const throwErrorStub = stub();
  const definitionMock = {
    src: 'src',
    bundle: undefined,
    update: updateStub,
  };

  beforeEach(() => {
    clientMock = {
      getOrganization: () => ({
        getAppDefinition: () => definitionMock,
      }),
    };

    ({ activateBundle } = proxyquire('./activate-bundle', {
      'contentful-management': {
        createClient: () => {
          return clientMock;
        },
      },
      '../utils': {
        throwError: throwErrorStub,
      },
    }));
  });

  it('updates definition with bundle and sets src to undefined', async () => {
    await activateBundle(mockedSettings);
    assert.strictEqual(definitionMock.bundle.sys.id, mockedSettings.bundleId);
    assert.strictEqual(definitionMock.src, undefined);
    assert.strictEqual(updateStub.called, true);
    assert(console.log.calledWith(match(/Your app bundle was activated/)));
  });
  it('shows error when update went wrong', async () => {
    definitionMock.update = stub().rejects(new Error());
    await activateBundle(mockedSettings);
    assert.strictEqual(throwErrorStub.called, true);
  });
});
