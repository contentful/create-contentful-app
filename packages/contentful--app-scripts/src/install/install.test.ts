import { SinonStub, stub } from 'sinon';
import assert from 'assert';
import { APP_DEF_ENV_KEY } from '../constants';
import proxyquire from 'proxyquire';
import { REDIRECT_URL } from './install';

const TEST_DEF_ID = 'test-def-id';

describe('install', () => {
  let subject: typeof import('./install').installToEnvironment,
    installMock: SinonStub,
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
    installMock = stub();
    inquirerMock = stub();
    ({ installToEnvironment: subject } = proxyquire('./install', {
      open: installMock,
      inquirer: { prompt: inquirerMock },
    }));
  });

  it('works with option passed', () => {
    subject({ definitionId: TEST_DEF_ID });
    assert(installMock.calledWith(`${REDIRECT_URL}&id=${TEST_DEF_ID}`));
  });

  it('shows prompt when no definition is provided', () => {
    subject({});
    assert.strictEqual(inquirerMock.called, true);
  });

  it('works with env variable set', () => {
    process.env[APP_DEF_ENV_KEY] = TEST_DEF_ID;
    subject({});
    assert(installMock.calledWith(`${REDIRECT_URL}&id=${TEST_DEF_ID}`));
  });
});
