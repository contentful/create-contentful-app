const proxyquire = require('proxyquire');
const { stub } = require('sinon');
const assert = require('assert');

const makeTestSubject = (open = stub(), prompt = stub()) => {
  return proxyquire('../lib/login', {
    open,
    inquirer: { prompt }
  });
};

describe('login', () => {
  beforeEach(() => {
    stub(process, 'exit');
    stub(console, 'log');
  });

  afterEach(() => {
    process.exit.restore();
    console.log.restore();
  });

  it('exits when unable to open the browser', () => {
    const openStub = stub();
    openStub.throws(new Error());
    const login = makeTestSubject(openStub);

    login();

    assert(process.exit.called);
  });

  it('exits when unable to get input', () => {
    const openStub = stub();
    const promptStub = stub().throws(new Error());
    const login = makeTestSubject(openStub, promptStub);

    login();

    assert(process.exit.called);
  });

  it('returns management token', async () => {
    const mgmtToken = 'token';
    const openStub = stub();
    const promptStub = stub().returns({ mgmtToken });
    const login = makeTestSubject(openStub, promptStub);

    assert.strictEqual(await login(), mgmtToken);
  });
});
