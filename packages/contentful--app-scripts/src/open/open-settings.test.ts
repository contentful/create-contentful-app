import { SinonStub, stub } from 'sinon';
import assert from 'assert';
import { APP_DEF_ENV_KEY } from '../../utils/constants';
import proxyquire from 'proxyquire';
import { REDIRECT_URL } from './open-settings';
import { OpenSettingsOptions } from '.';

const TEST_DEF_ID = 'test-def-id';

describe('openSettings', () => {
  let subject: (options: OpenSettingsOptions) => Promise<void>,
    openMock: SinonStub,
    inquirerMock: SinonStub;
  beforeEach(() => {
    delete process.env[APP_DEF_ENV_KEY];
    stub(console, 'log');
  });

  afterEach(() => {
    (console.log as SinonStub).restore();
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
