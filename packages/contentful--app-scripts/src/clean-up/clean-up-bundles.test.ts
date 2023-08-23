import { stub, spy, match, useFakeTimers, SinonStub } from 'sinon';
import assert from 'assert';
import proxyquire from 'proxyquire';
import { PlainClientAPI } from 'contentful-management';
import { CleanupSettings } from '../types';

const mockedSettings = { definition: { value: 'test' }, organization: { value: 'test' } } as CleanupSettings;
const bundlesFixture = [
  { sys: { id: 'test-1' } },
  { sys: { id: 'test-2' } },
  { sys: { id: 'test-3' } },
  { sys: { id: 'test-4' } },
  { sys: { id: 'test-5' } },
  { sys: { id: 'test-6' } },
  { sys: { id: 'test-7' } },
  { sys: { id: 'test-8' } },
];

describe('cleanUpBundles', () => {
  let subject: typeof import('./clean-up-bundles').cleanUpBundles,
    clientMock: PlainClientAPI,
    deleteMock: SinonStub,
    createClientArgs: any[];
  let mockedBundles = bundlesFixture;

  beforeEach(() => {
    stub(console, 'log');
  });

  afterEach(() => {
    mockedBundles = bundlesFixture;
    (console.log as SinonStub).restore();
  });

  beforeEach(() => {
    deleteMock = stub();
    clientMock = {
      appBundle: {
        getMany: () => ({
          total: mockedBundles.length,
          items: mockedBundles,
        }),
        delete: deleteMock,
      },
      appDefinition: {
        get: () => ({ bundle: { sys: { id: 'active-bundle' } } }),
        delete: deleteMock,
      },
    } as unknown as PlainClientAPI;
    ({ cleanUpBundles: subject } = proxyquire('./clean-up-bundles', {
      'contentful-management': {
        createClient: (...args: any[]) => {
          createClientArgs = args;
          return clientMock;
        },
      },
      '../constants': {
        MAX_CONCURRENT_DELETION_CALLS: 2,
      },
    }));
  });

  it('deletes the correct amount when keep is defined with number', async () => {
    const keep = 1;
    await subject({ ...mockedSettings, keep });
    assert.strictEqual(deleteMock.callCount, mockedBundles.length - keep);
  });
  it('deletes all when 0 to keep on a list of 4', async () => {
    await subject({ ...mockedSettings, keep: 0 });
    assert.strictEqual(deleteMock.callCount, mockedBundles.length);
  });
  it('does not delete the active one', async () => {
    mockedBundles = [{ sys: { id: 'test-1' } }, { sys: { id: 'active-bundle' } }];
    await subject({ ...mockedSettings, keep: 0 });
    assert.strictEqual(deleteMock.callCount, 1);
  });
  it('shows a warning when nothing will be deleted and delete is not called', async () => {
    await subject({ ...mockedSettings, keep: 100 });
    assert.strictEqual(deleteMock.called, false);
    assert((console.log as SinonStub).calledWith(match(/There is nothing to delete/)));
  });
  it('only runs specific deletion calls at a time ', async () => {
    const clock = useFakeTimers();
    clientMock.appBundle.delete = stub().callsFake(() => new Promise((r) => setTimeout(r, 100)));
    subject({ ...mockedSettings, keep: 0 });
    await clock.tickAsync(50);
    // Here we expect only the first ones to be called
    assert.strictEqual((clientMock.appBundle.delete as SinonStub).callCount, 2); // 2 is batch size
    await clock.tickAsync(150);
    // Here the next ones also have called
    assert.strictEqual((clientMock.appBundle.delete as SinonStub).callCount, 4); // 2 before + 2 new

    clock.restore();
  });
  it('slow call will occupy slot until finished', async () => {
    const clock = useFakeTimers();
    mockedBundles.unshift({ sys: { id: 'slow' } });
    mockedBundles = mockedBundles.reverse();
    clientMock.appBundle.delete = stub().callsFake(
      ({ appBundleId }) => new Promise((r) => setTimeout(r, appBundleId === 'slow' ? 200 : 100)),
    );
    subject({ ...mockedSettings, keep: 0 });
    await clock.tickAsync(50);
    // Here we expect only the first ones to be called
    assert.strictEqual((clientMock.appBundle.delete as SinonStub).callCount, 2); // 2 is batch size
    await clock.tickAsync(100);
    // Here there are still only two called
    assert.strictEqual((clientMock.appBundle.delete as SinonStub).callCount, 3); // 2 before + 1 new  (1 still in flight and occupies slot)
    await clock.tickAsync(100);
    assert.strictEqual((clientMock.appBundle.delete as SinonStub).callCount, 5); // 3 before + 2 new  (slot is free again)

    clock.restore();
  });
  it('supports custom defined host domain', async () => {
    await subject({ ...mockedSettings, host: 'jane.doe.com' });
    assert.strictEqual(createClientArgs[0].host, 'jane.doe.com');
  });
  it('queries more than 100 bundles', async () => {
    spy(clientMock.appBundle, 'getMany');
    await subject(mockedSettings);
    assert((clientMock.appBundle.getMany as SinonStub).calledWith(match({ query: { limit: 1000 } })));
  });
});
