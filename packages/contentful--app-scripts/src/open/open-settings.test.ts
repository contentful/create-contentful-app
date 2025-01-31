import { SinonStub, stub } from 'sinon';
import assert from 'assert';
import {
  APP_DEF_ENV_KEY,
  DEFAULT_CONTENTFUL_API_HOST,
  DEFAULT_CONTENTFUL_APP_HOST,
} from '../constants';
import proxyquire from 'proxyquire';

const TEST_DEF_ID = 'test-def-id';

describe('openSettings', () => {
  let subject: typeof import('./open-settings').openSettings,
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

  it('works with app definition id and host options passed', async () => {
    await subject({ definitionId: TEST_DEF_ID, host: DEFAULT_CONTENTFUL_API_HOST });
    assert(
      openMock.calledWith(
        `https://${DEFAULT_CONTENTFUL_APP_HOST}/deeplink?link=app-definition&id=${TEST_DEF_ID}`
      )
    );
  });

  it('shows prompt when no options are provided', () => {
    subject({});
    assert.strictEqual(inquirerMock.called, true);
  });

  it('throws an error when no app definition is defined', async () => {
    try {
      await subject({});
    } catch (err) {
      assert.strictEqual(err.message, 'No app-definition-id');
    }
  });

  it('works with app id env variable set', async () => {
    process.env[APP_DEF_ENV_KEY] = TEST_DEF_ID;
    await subject({ host: DEFAULT_CONTENTFUL_API_HOST });
    assert(
      openMock.calledWith(
        `https://${DEFAULT_CONTENTFUL_APP_HOST}/deeplink?link=app-definition&id=${TEST_DEF_ID}`
      )
    );
  });

  it('works with EU host option passed', async () => {
    await subject({ definitionId: TEST_DEF_ID, host: 'api.eu.contentful.com' });
    assert(
      openMock.calledWith(
        `https://app.eu.contentful.com/deeplink?link=app-definition&id=${TEST_DEF_ID}`
      )
    );
  });
});
