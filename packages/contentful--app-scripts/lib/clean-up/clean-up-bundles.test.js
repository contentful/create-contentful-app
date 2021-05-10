const { stub, match, useFakeTimers } = require('sinon');
const assert = require('assert');
const proxyquire = require('proxyquire');

const mockedSettings = { definition: { value: 'test' }, organization: { value: 'test' } };
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
  let subject, clientMock, deleteMock;
  let mockedBundles = bundlesFixture;

  beforeEach(() => {
    stub(console, 'log');
  });

  afterEach(() => {
    mockedBundles = bundlesFixture;
    console.log.restore();
  });

  beforeEach(() => {
    deleteMock = stub();
    clientMock = {
      appBundle: {
        getMany: () => ({ items: mockedBundles }),
        delete: deleteMock,
      },
      appDefinition: {
        get: () => ({ bundle: { sys: { id: 'active-bundle' } } }),
        delete: deleteMock,
      },
    };
    ({ cleanUpBundles: subject } = proxyquire('./clean-up-bundles', {
      'contentful-management': {
        createClient: () => clientMock,
      },
      '../../utils/constants': {
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
    assert(console.log.calledWith(match(/There is nothing to delete/)));
  });
  it('only runs specific deletion calls at a time ', async () => {
    const clock = useFakeTimers();
    // a map of all deletion calls with a timestamp
    const deletionCallTimes = [];
    clientMock.appBundle.delete = () => {
      // adds a time-stamp and calls return a promise after 100ms
      deletionCallTimes.push(Date.now());
      return new Promise((res) => setTimeout(() => res(), 100));
    };
    subject({ ...mockedSettings, keep: 0 });
    await clock.tickAsync(bundlesFixture.length * 200);
    deletionCallTimes.forEach((timestamp, index) => {
      if (index % 2 === 0) {
        // when the first call in batch should be called approx at the same time as the next one
        assert.strictEqual(deletionCallTimes[index + 1] - deletionCallTimes[index] < 100, true);
      } else if (deletionCallTimes[index + 1]) {
        // when the second call in batch the one after should wait for the first two to finish
        assert.strictEqual(deletionCallTimes[index + 1] - deletionCallTimes[index] > 100, true);
      }
    });
  });
});
