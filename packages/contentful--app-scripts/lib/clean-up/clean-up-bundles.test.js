const { stub, match } = require('sinon');
const assert = require('assert');
const proxyquire = require('proxyquire');

const mockedBundles = [
  { sys: { id: 'test-1' } },
  { sys: { id: 'test-2' } },
  { sys: { id: 'test-3' } },
  { sys: { id: 'test-4' } },
];

const mockedSettings = { definition: { value: 'test' }, organization: { value: 'test' } };

describe('cleanUpBundles', () => {
  let subject, clientMock, deleteMock;
  beforeEach(() => {
    stub(console, 'log');
  });

  afterEach(() => {
    console.log.restore();
  });

  beforeEach(() => {
    deleteMock = stub();
    clientMock = {
      appBundle: {
        getMany: () => ({ items: mockedBundles }),
        delete: deleteMock,
      },
    };
    ({ cleanUpBundles: subject } = proxyquire('./clean-up-bundles', {
      'contentful-management': {
        createClient: () => clientMock,
      },
    }));
  });

  it('deletes 3 when 1 to keep on a list of 4', async () => {
    await subject({ ...mockedSettings, keep: 1 });
    assert.strictEqual(deleteMock.callCount, 3);
  });
  it('deletes all when 0 to keep on a list of 4', async () => {
    await subject({ ...mockedSettings, keep: 0 });
    assert.strictEqual(deleteMock.callCount, mockedBundles.length);
  });
  it('shows a warning when nothing will be deleted and delete is not called', async () => {
    await subject({ ...mockedSettings, keep: 100 });
    assert.strictEqual(deleteMock.called, false);
    assert(console.log.calledWith(match(/There is nothing to delete/)));
  });
});
