const proxyquire = require('proxyquire');
const { stub, spy } = require('sinon');
const assert = require('assert');

describe('getManagementToken-js', () => {
  context('getManagementToken', () => {
    let subject, promptMock, openMock;

    beforeEach(() => {
      stub(console, 'log');
    });

    afterEach(() => {
      console.log.restore();
    });

    beforeEach(() => {
      promptMock = stub();
      openMock = stub();

      ({ getManagementToken: subject } = proxyquire('./get-management-token', {
        inquirer: { prompt: promptMock },
        open: openMock,
        'contentful-management': {
          createClient() {
            return {
              async getOrganizations() {
                throw new Error();
              },
            };
          },
        },
      }));
    });

    it('throws when unable to open the browser', async () => {
      openMock.throws(new Error());
      await assert.rejects(() => subject());
    });

    it('throws when unable to get input', async () => {
      promptMock.throws(new Error());
      await assert.rejects(() => subject());
    });

    it('returns management token', async () => {
      const mgmtToken = 'token';
      promptMock.returns({ mgmtToken });
      assert.strictEqual(await subject(), mgmtToken);
    });
  });

  context('checkTokenValidity', () => {
    let subject, createClientSpy, promptMock, openMock;
    const mgmtToken = 'token';
    const host = 'host';
    const mockedSettings = {
      host,
      accessToken: mgmtToken,
    };

    beforeEach(() => {
      promptMock = stub();
      openMock = stub();
      createClientSpy = spy();

      ({ getManagementToken: subject } = proxyquire('./get-management-token', {
        inquirer: { prompt: promptMock },
        open: openMock,
        'contentful-management': {
          createClient: createClientSpy,
        },
      }));
    });

    it('Call CMA with a host argument', async () => {
      promptMock.returns({ mgmtToken });
      assert.strictEqual(await subject(host), mgmtToken);
      assert.strictEqual(createClientSpy.args[0][0].host, mockedSettings.host);
    });
  });
});
