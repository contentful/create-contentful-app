const proxyquire = require('proxyquire');
const { stub, match } = require('sinon');
const assert = require('assert');
const {
  APP_DEF_ENV_KEY,
} = require('../../utils/constants');

const organizationId = 'orgId';
const token = 'token';

describe('createAppDefinition', () => {
  let subject, clientMock, selectFromListMock, cachedEnvVarsMock;

  beforeEach(() => {
    stub(console, 'log');
  });

  afterEach(() => {
    console.log.restore();
  });

  beforeEach(() => {
    clientMock = {
      getOrganization: stub(),
      getOrganizations: stub()
    };

    cachedEnvVarsMock = stub().resolves(undefined);

    selectFromListMock = stub();

    ({ createAppDefinition: subject } = proxyquire('./create-app-definition', {
      'contentful-management': {
        createClient: () => {
          return clientMock;
        }
      },
      '../../utils/cache-credential': {
        cacheEnvVars: cachedEnvVarsMock
      },
      '../utils': {
        selectFromList: selectFromListMock
      }
    }));
  });

  it('throws with invalid options', () => assert.rejects(() => subject(), /TypeError/));

  it('throws if unable to fetch organizations', async () => {
    clientMock.getOrganizations = stub().rejects(new Error());

    await assert.rejects(() => subject(token, { locations: [] }));
    assert(console.log.calledWith(match(/Could not fetch your organizations/)));
  });

  it('throws if unable to create definition', async () => {
    clientMock.getOrganization = stub().resolves({ createAppDefinition: stub().rejects(new Error()) });
    clientMock.getOrganizations = stub().resolves({ items: [{ name: 'name', sys: { id: organizationId } }] });
    selectFromListMock.returns({ name: 'name', value: organizationId });

    await assert.rejects(() => subject(token, { locations: [] }));
    assert(console.log.calledWith(match(/Something went wrong while creating the app definition/)));
  });

  it('logs success message', async () => {
    const appId = 'appId';
    const orgSettingsLink = 'https://app.contentful.com/deeplink?link=org';
    const appLink = `https://app.contentful.com/deeplink?link=apps&id=${appId}`;
    const tutorialLink = 'https://ctfl.io/app-tutorial';

    clientMock.getOrganization = stub().resolves({
      createAppDefinition: stub().resolves({ sys: { id: 'appId' } })
    });
    clientMock.getOrganizations = stub().resolves({ items: [{ name: 'name', sys: { id: organizationId } }] });
    selectFromListMock.returns({ name: 'name', value: organizationId });

    await assert.doesNotReject(() => subject(token, { locations: [] }));

    const loggedMessage = console.log.getCall(0).args[0];

    assert(loggedMessage.includes('Success'));
    assert(loggedMessage.includes(orgSettingsLink));
    assert(loggedMessage.includes(appLink));
    assert(loggedMessage.includes(tutorialLink));
    assert.deepStrictEqual(cachedEnvVarsMock.args[0][0], {[APP_DEF_ENV_KEY]: 'appId'});
  });
});
