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
  let activateBundle, clientMock, updateStub;
  beforeEach(() => {
    stub(console, 'log');
  });

  afterEach(() => {
    console.log.restore();
  });

  const throwErrorStub = stub();
  const definitionMock = {
    src: 'src',
    bundle: undefined,
  };

  beforeEach(() => {
    updateStub = stub();
    clientMock = {
      rawRequest: ({ method }) => (method === 'PUT' ? updateStub() : definitionMock),
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
    assert(console.log.calledWith(match(/Your app bundle was activated/)));
  });
  it('shows error when update went wrong', async () => {
    updateStub = stub().rejects(new Error());
    await activateBundle(mockedSettings);
    assert.strictEqual(throwErrorStub.called, true);
  });
});
