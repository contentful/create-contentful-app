const { stub, match } = require('sinon');
const assert = require('assert');
const { APP_DEF_ENV_KEY } = require('../../utils/constants');
const proxyquire = require('proxyquire');
const { REDIRECT_URL } = require('./open-settings');

const TEST_DEF_ID = 'test-def-id';

describe('openSettings', () => {
  let subject, openMock;
  beforeEach(() => {
    stub(console, 'log');
  });

  afterEach(() => {
    console.log.restore();
    delete process.env[APP_DEF_ENV_KEY];
  });

  beforeEach(() => {
    openMock = stub();
    ({ openSettings: subject } = proxyquire('./open-settings', {
      open: openMock,
    }));
  });

  it('works with env variable set', () => {
    process.env[APP_DEF_ENV_KEY] = TEST_DEF_ID;
    subject({ definitionId: TEST_DEF_ID });
    assert(openMock.calledWith(`${REDIRECT_URL}&id=${TEST_DEF_ID}`));
  });

  it('throws error when no definition is provided and open is not called', () => {
    subject({});
    assert(console.log.calledWith(match(/There was no app-definition defined/)));
    assert.strictEqual(openMock.called, false);
  });

  it('works with env variable set', () => {
    process.env[APP_DEF_ENV_KEY] = TEST_DEF_ID;
    subject({});
    assert(openMock.calledWith(`${REDIRECT_URL}&id=${TEST_DEF_ID}`));
  });
});
