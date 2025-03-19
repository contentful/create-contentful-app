import proxyquire from 'proxyquire';
import { stub, match, SinonStub } from 'sinon';
import assert from 'assert';
import { AddLocationsSettings } from '../types';
import { AppLocation } from 'contentful-management';

const organizationId = 'orgId';
const definitionId = 'defId';
const token = 'test-token';

describe('add', () => {
  let addLocations: (settings: AddLocationsSettings) => Promise<void>,
    clientMock: any,
    createTypeSafeLocationsMock: SinonStub;

  beforeEach(() => {
    stub(console, 'log');
  });

  afterEach(() => {
    (console.log as SinonStub).restore();
  });

  beforeEach(() => {
    clientMock = {
      appDefinition: {
        get: stub(),
        update: stub(),
      },
      appBundle: {
        get: stub(),
      },
    };

    createTypeSafeLocationsMock = stub();

    ({ add: addLocations } = proxyquire('./add-locations', {
      'contentful-management': {
        createClient: () => clientMock,
      },
      '../create-type-safe-locations': {
        createTypeSafeLocations: createTypeSafeLocationsMock,
      },
      ora: () => ({
        start: () => ({
          stop: stub(),
        }),
      }),
    }));
  });

  it('throws if unable to fetch app definition', async () => {
    clientMock.appDefinition.get.rejects(new Error('Fetch failed'));

    const settings = {
      accessToken: token,
      organization: { value: organizationId },
      definition: { value: definitionId, name: 'Test App' },
      host: 'test-host',
    } as AddLocationsSettings;

    await assert.rejects(() => addLocations(settings));
    assert(
        (console.log as SinonStub).calledWith(
        match(/Something went wrong addding locations./)
        )
    );
  });

  it('updates app definition with new locations', async () => {
    const currentDefinition = {
      locations: [{ location: 'dialog' }],
      bundle: { sys: { id: 'bundle-id' } },
      src: undefined,
    };

    const currentBundle = { files: ['file1.js'] };
    const typeSafeLocations: AppLocation[] = [{ location: 'app-config' }];

    clientMock.appDefinition.get.resolves(currentDefinition);
    clientMock.appBundle.get.resolves(currentBundle);
    createTypeSafeLocationsMock.returns(typeSafeLocations);

    const settings = {
      accessToken: token,
      organization: { value: organizationId },
      definition: { value: definitionId, name: 'Test App' },
      host: 'test-host',
    } as AddLocationsSettings;

    await assert.doesNotReject(() => addLocations(settings));

    assert(clientMock.appDefinition.update.calledOnce);
    const updatedDefinition = clientMock.appDefinition.update.getCall(0).args[1];
    assert.deepStrictEqual(updatedDefinition.locations, [
      { location: 'dialog' },
      { location: 'app-config' },
    ]);
  });

  it('sets default src if no frontend files or src are present', async () => {
    const currentDefinition = {
      locations: [{ location: 'dialog' }],
      bundle: null,
      src: undefined,
    };

    const typeSafeLocations: AppLocation[] = [{ location: 'app-config' }];

    clientMock.appDefinition.get.resolves(currentDefinition);
    clientMock.appBundle.get.resolves(undefined);
    createTypeSafeLocationsMock.returns(typeSafeLocations);

    const settings = {
      accessToken: token,
      organization: { value: organizationId },
      definition: { value: definitionId, name: 'Test App' },
      host: 'test-host',
    } as AddLocationsSettings;

    await assert.doesNotReject(() => addLocations(settings));

    const updatedDefinition = clientMock.appDefinition.update.getCall(0).args[1];
    assert.strictEqual(updatedDefinition.src, 'http://localhost:3000');
  });

  it('does not set default src if frontend files or src are present', async () => {
    const currentDefinition = {
      locations: [{ location: 'dialog' }],
      bundle: { sys: { id: 'bundle-id' } },
      src: 'https://example.com',
    };

    const currentBundle = { files: ['file1.js'] };
    const typeSafeLocations: AppLocation[] = [{ location: 'app-config' }];

    clientMock.appDefinition.get.resolves(currentDefinition);
    clientMock.appBundle.get.resolves(currentBundle);
    createTypeSafeLocationsMock.returns(typeSafeLocations);

    const settings = {
      accessToken: token,
      organization: { value: organizationId },
      definition: { value: definitionId, name: 'Test App' },
      host: 'test-host',
    } as AddLocationsSettings;

    await assert.doesNotReject(() => addLocations(settings));

    const updatedDefinition = clientMock.appDefinition.update.getCall(0).args[1];
    assert.strictEqual(updatedDefinition.src, 'https://example.com');
  });

  it('logs success message with added locations', async () => {
    const currentDefinition = {
      locations: [{ location: 'dialog' }],
      bundle: null,
      src: undefined,
    };

    const typeSafeLocations: AppLocation[] = [{ location: 'app-config' }];

    clientMock.appDefinition.get.resolves(currentDefinition);
    clientMock.appBundle.get.resolves(undefined);
    createTypeSafeLocationsMock.returns(typeSafeLocations);

    const settings = {
      accessToken: token,
      organization: { value: organizationId },
      definition: { value: definitionId, name: 'Test App' },
      host: 'test-host',
    } as AddLocationsSettings;

    await assert.doesNotReject(() => addLocations(settings));

    const loggedMessage = (console.log as SinonStub).getCall(0).args[0];
    assert(loggedMessage.includes('Success'));
    assert(loggedMessage.includes('app-config'));
  });
});