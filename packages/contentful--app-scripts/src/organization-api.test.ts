import { stub, match, SinonStub } from 'sinon';
import proxyquire from 'proxyquire';
import assert from 'assert';
import { PlainClientAPI } from 'contentful-management';

function makeOrgs(start: number, count: number) {
  return Array.from({ length: count }, (_, i) => {
    const n = start + i;
    return { name: `Org ${n}`, sys: { id: `org-${n}` } };
  });
}

describe('organization-api', () => {
  let selectOrganization: typeof import('./organization-api').selectOrganization,
    clientMock: PlainClientAPI,
    getAllStub: SinonStub,
    selectFromListMock: SinonStub;

  beforeEach(() => {
    getAllStub = stub();
    clientMock = {
      organization: { getAll: getAllStub },
    } as unknown as PlainClientAPI;

    selectFromListMock = stub().resolves({ name: 'Org 1', value: 'org-1' });

    ({ selectOrganization } = proxyquire('./organization-api', {
      './utils': {
        selectFromList: selectFromListMock,
        throwError: (_err: Error, message: string) => {
          console.log(message);
          throw new Error(message);
        },
      },
      ora: () => ({
        start: () => ({ stop: stub() }),
      }),
    }));
  });

  it('fetches all organizations across multiple pages', async () => {
    const page1 = makeOrgs(1, 100);
    const page2 = makeOrgs(101, 5);

    getAllStub.onFirstCall().resolves({ items: page1, total: 105 });
    getAllStub.onSecondCall().resolves({ items: page2, total: 105 });

    await selectOrganization(clientMock);

    assert.strictEqual(getAllStub.callCount, 2);
    assert.deepStrictEqual(getAllStub.firstCall.args[0], { query: { skip: 0, limit: 100 } });
    assert.deepStrictEqual(getAllStub.secondCall.args[0], { query: { skip: 100, limit: 100 } });

    const organizations = selectFromListMock.firstCall.args[0];
    assert.strictEqual(organizations.length, 105);
    assert.deepStrictEqual(organizations[0], { name: 'Org 1', value: 'org-1' });
    assert.deepStrictEqual(organizations[104], { name: 'Org 105', value: 'org-105' });
  });

  it('fetches a single page when all orgs fit', async () => {
    const page1 = makeOrgs(1, 3);
    getAllStub.resolves({ items: page1, total: 3 });

    await selectOrganization(clientMock);

    assert.strictEqual(getAllStub.callCount, 1);
    assert.deepStrictEqual(getAllStub.firstCall.args[0], { query: { skip: 0, limit: 100 } });
    assert.strictEqual(selectFromListMock.firstCall.args[0].length, 3);
  });

  it('throws when unable to fetch organizations', async () => {
    stub(console, 'log');
    getAllStub.rejects(new Error('network'));

    await assert.rejects(() => selectOrganization(clientMock), /Could not fetch your organizations/);
    assert((console.log as SinonStub).calledWith(match(/Could not fetch your organizations/)));

    (console.log as SinonStub).restore();
  });
});
