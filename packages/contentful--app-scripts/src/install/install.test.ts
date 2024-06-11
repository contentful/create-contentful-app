import { SinonStub, stub } from 'sinon';
import assert from 'assert';
import { APP_DEF_ENV_KEY } from '../constants';
import proxyquire from 'proxyquire';

const TEST_DEF_ID = 'test-def-id';
const TEST_HOST = 'test.host.com';

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

  it('works with an app ID option passed', () => {
    subject({ definitionId: TEST_DEF_ID });
    assert(
      installMock.calledWith(`https://app.contentful.com/deeplink?link=apps&id=${TEST_DEF_ID}`)
    );
  });

  it('works with both host and app ID options passed', () => {
    subject({ host: TEST_HOST, definitionId: TEST_DEF_ID });
    assert(installMock.calledWith(`https://${TEST_HOST}/deeplink?link=apps&id=${TEST_DEF_ID}`));
  });

  it('shows prompt when no app definition is provided', () => {
    subject({});
    assert.strictEqual(inquirerMock.called, true);
  });

  it('shows prompt when host is provided, but no app definition', () => {
    subject({ host: TEST_HOST });
    assert.strictEqual(inquirerMock.called, true);
  });

  it('works with env variable set', () => {
    process.env[APP_DEF_ENV_KEY] = TEST_DEF_ID;
    subject({});
    assert(
      installMock.calledWith(`https://app.contentful.com/deeplink?link=apps&id=${TEST_DEF_ID}`)
    );
  });
});
