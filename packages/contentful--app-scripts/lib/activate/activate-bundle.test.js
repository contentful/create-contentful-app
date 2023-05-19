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
  // eslint-disable-next-line no-unused-vars
  let activateBundle, clientMock, updateStub, createClientArgs;
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
    locations: [],
  };

  beforeEach(() => {
    updateStub = stub();
    clientMock = {
      appDefinition: {
        get: () => definitionMock,
        update: () => updateStub(),
      },
    };

    ({ activateBundle } = proxyquire('./activate-bundle', {
      'contentful-management': {
        createClient: (...args) => {
          createClientArgs = args;
          return clientMock;
        },
      },
      '../utils': {
        throwError: throwErrorStub,
      },
    }));
  });

  it('updates definition with bundle, sets default location, and sets src to undefined', async () => {
    await activateBundle(mockedSettings);
    assert.strictEqual(definitionMock.bundle.sys.id, mockedSettings.bundleId);
    assert.strictEqual(definitionMock.locations.length, 1);
    assert.strictEqual(definitionMock.src, undefined);
    assert.strictEqual(updateStub.called, true);
    assert(console.log.calledWith(match(/Your app bundle was activated/)));
  });
  it('shows error when update went wrong', async () => {
    updateStub = stub().rejects(new Error());
    await activateBundle(mockedSettings);
    assert.strictEqual(throwErrorStub.called, true);
  });
  it('supports custom defined host domain', async () => {
    await activateBundle({ ...mockedSettings, host: 'jane.doe.com' });
    assert.strictEqual(createClientArgs[0].host, 'jane.doe.com');
  });
});
