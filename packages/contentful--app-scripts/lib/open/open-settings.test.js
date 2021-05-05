const { stub } = require('sinon');
const assert = require('assert');
const { APP_DEF_ENV_KEY } = require('../../utils/constants');
const proxyquire = require('proxyquire');
const { REDIRECT_URL } = require('./open-settings');

const TEST_DEF_ID = 'test-def-id';

describe('openSettings', () => {
  let subject, openMock, inquirerMock;
  beforeEach(() => {
    delete process.env[APP_DEF_ENV_KEY];
    stub(console, 'log');
  });

  afterEach(() => {
    console.log.restore();
    delete process.env[APP_DEF_ENV_KEY];
  });

  beforeEach(() => {
    openMock = stub();
    inquirerMock = stub();
    ({ openSettings: subject } = proxyquire('./open-settings', {
      open: openMock,
      inquirer: { prompt: inquirerMock },
    }));
  });

  it('works with option passed', () => {
    subject({ definitionId: TEST_DEF_ID });
    assert(openMock.calledWith(`${REDIRECT_URL}&id=${TEST_DEF_ID}`));
  });

  it('shows prompt when no definition is provided', () => {
    subject({});
    assert.strictEqual(inquirerMock.called, true);
  });

  it('works with env variable set', () => {
    process.env[APP_DEF_ENV_KEY] = TEST_DEF_ID;
    subject({});
    assert(openMock.calledWith(`${REDIRECT_URL}&id=${TEST_DEF_ID}`));
  });
});
