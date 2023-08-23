import { stub, match, SinonStub } from 'sinon';
import assert from 'assert';
import proxyquire from 'proxyquire';
import { AppDefinitionProps, PlainClientAPI } from 'contentful-management';
import { ActivateSettings } from '.';

const mockedSettings = {
  accessToken: 'token',
  organization: { value: 'id' },
  definition: { value: 'id' },
  bundleId: 'bundle-id',
} as ActivateSettings;

describe('activate-bundle', () => {
  let activateBundle: typeof import('./activate-bundle').activateBundle,
    clientMock: PlainClientAPI,
    updateStub: SinonStub,
    createClientArgs: any[];

  beforeEach(() => {
    stub(console, 'log');
  });

  afterEach(() => {
    (console.log as SinonStub).restore();
  });

  const throwErrorStub = stub();
  const definitionMock = {
    src: 'src',
    bundle: undefined,
    locations: [],
  } as unknown as AppDefinitionProps;

  beforeEach(() => {
    updateStub = stub();
    clientMock = {
      appDefinition: {
        get: () => definitionMock,
        update: () => updateStub(),
      },
    } as unknown as PlainClientAPI;

    ({ activateBundle } = proxyquire('./activate-bundle', {
      'contentful-management': {
        createClient: (...args: any[]) => {
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
    assert.strictEqual(definitionMock.bundle?.sys.id, mockedSettings.bundleId);
    assert.strictEqual(definitionMock.locations?.length, 1);
    assert.strictEqual(definitionMock.src, undefined);
    assert.strictEqual(updateStub.called, true);
    assert((console.log as SinonStub).calledWith(match(/Your app bundle was activated/)));
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
