import { stub, match, SinonStub } from 'sinon';
import assert from 'assert';
import proxyquire from 'proxyquire';
import { AppBundleProps, AppDefinitionProps, PlainClientAPI } from 'contentful-management';
import { ActivateSettings } from '../types';

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
    appBundleGetStub: SinonStub,
    createClientArgs: any[],
    definitionMock: AppDefinitionProps;

  beforeEach(() => {
    stub(console, 'log');
  });

  afterEach(() => {
    (console.log as SinonStub).restore();
  });

  const throwErrorStub = stub();
  const defaultDefinitionMock = {
    src: 'src',
    bundle: undefined,
    locations: [],
  } as unknown as AppDefinitionProps;
  const bundleMock = {
    comment: 'my bundle',
    sys: {
      id: 'bundle-id',
      type: 'AppBundle',
      appDefinition: {
        sys: { id: 'app-def-id', type: 'Link', linkType: 'AppDefinition' },
      },
      organization: {
        sys: { type: 'Link', linkType: 'Organization', id: 'org-id' },
      },
    },
    files: [    { name: 'index.html', size: 2080, md5: 'fs7GaL66rRYCZm8VkQLiNP==' },],
    functions: [
      {
        name: 'Example App Event Handler Function',
        allowNetworks: [],
        description: 'This is an example to help you learn how App Event handler functions work.',
        path: 'functions/appevent-handler-example.js',
        id: 'appeventHandlerExample',
        accepts: ['appevent.handler'],
      },
    ],
  } as unknown as AppBundleProps;

  beforeEach(() => {
    definitionMock = { ...defaultDefinitionMock };
    updateStub = stub();
    appBundleGetStub = stub().resolves(bundleMock);
    clientMock = {
      appDefinition: {
        get: () => definitionMock,
        update: () => updateStub(),
      },
      appBundle: {
        get: () => appBundleGetStub()
      }
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

  it('updates definition with bundle, sets default location, and sets src to undefined when bundle has a frontend', async () => {
    await activateBundle({...mockedSettings, hasFrontend: true});
    assert.strictEqual(definitionMock.bundle?.sys.id, mockedSettings.bundleId);
    assert.strictEqual(definitionMock.locations?.length, 1);
    assert.strictEqual(definitionMock.src, undefined);
    assert.strictEqual(updateStub.called, true);
    assert((console.log as SinonStub).calledWith(match(/Your app bundle was activated/)));
  });
  it('updates definition with bundle, does not set default location, and retains src when bundle does not have a frontend', async () => {
    await activateBundle({...mockedSettings, hasFrontend: false});
    assert.strictEqual(definitionMock.bundle?.sys.id, mockedSettings.bundleId);
    assert.strictEqual(definitionMock.locations?.length, 0);
    assert.strictEqual(definitionMock.src, 'src');
    assert.strictEqual(updateStub.called, true);
    assert((console.log as SinonStub).calledWith(match(/Your app bundle was activated/)));
  });
  it('retrieves the app bundle when `hasFrontend` is not passed in', async () => {
    await activateBundle({
      ...mockedSettings, hasFrontend: undefined
    });
    assert.strictEqual(definitionMock.bundle?.sys.id, mockedSettings.bundleId);
    assert.strictEqual(definitionMock.locations?.length, 1);
    assert.strictEqual(definitionMock.src, undefined);
    assert.strictEqual(appBundleGetStub.called, true);
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
