import proxyquire from 'proxyquire';
import { stub, match, SinonStub } from 'sinon';
import assert from 'assert';
import { APP_DEF_ENV_KEY } from '../../utils/constants';
import { ClientAPI } from 'contentful-management';

const organizationId = 'orgId';
const token = 'token';

describe('createAppDefinition', () => {
  let subject: (accessToken?: string, appDefinitionSettings?: any) => Promise<void>,
    clientMock: ClientAPI,
    selectFromListMock: SinonStub,
    cachedEnvVarsMock: SinonStub;

  beforeEach(() => {
    stub(console, 'log');
  });

  afterEach(() => {
    (console.log as SinonStub).restore();
  });

  beforeEach(() => {
    clientMock = {
      getOrganization: stub(),
      getOrganizations: stub(),
    } as unknown as ClientAPI;

    cachedEnvVarsMock = stub().resolves(undefined);

    selectFromListMock = stub();

    ({ createAppDefinition: subject } = proxyquire('./create-app-definition', {
      'contentful-management': {
        createClient: () => {
          return clientMock;
        },
      },
      '../../utils/cache-credential': {
        cacheEnvVars: cachedEnvVarsMock,
      },
      '../utils': {
        selectFromList: selectFromListMock,
      },
    }));
  });

  it('throws with invalid options', () => assert.rejects(() => subject(), /TypeError/));

  it('throws if unable to fetch organizations', async () => {
    clientMock.getOrganizations = stub().rejects(new Error());

    await assert.rejects(() => subject(token, { locations: [] }));
    assert((console.log as SinonStub).calledWith(match(/Could not fetch your organizations/)));
  });

  it('throws if unable to create definition', async () => {
    clientMock.getOrganization = stub().resolves({
      createAppDefinition: stub().rejects(new Error()),
    });
    clientMock.getOrganizations = stub().resolves({
      items: [{ name: 'name', sys: { id: organizationId } }],
    });
    selectFromListMock.returns({ name: 'name', value: organizationId });

    await assert.rejects(() => subject(token, { locations: [] }));
    assert((console.log as SinonStub).calledWith(match(/Something went wrong while creating the app definition/)));
  });

  it('logs success message', async () => {
    const appId = 'appId';
    const orgSettingsLink = 'https://app.contentful.com/deeplink?link=org';
    const appLink = `https://app.contentful.com/deeplink?link=apps&id=${appId}`;
    const tutorialLink = 'https://ctfl.io/app-tutorial';

    clientMock.getOrganization = stub().resolves({
      createAppDefinition: stub().resolves({ sys: { id: 'appId' } }),
    });
    clientMock.getOrganizations = stub().resolves({
      items: [{ name: 'name', sys: { id: organizationId } }],
    });
    selectFromListMock.returns({ name: 'name', value: organizationId });

    await assert.doesNotReject(() => subject(token, { locations: [] }));

    const loggedMessage = (console.log as SinonStub).getCall(0).args[0];

    assert(loggedMessage.includes('Success'));
    assert(loggedMessage.includes(orgSettingsLink));
    assert(loggedMessage.includes(appLink));
    assert(loggedMessage.includes(tutorialLink));
    assert.deepStrictEqual(cachedEnvVarsMock.args[0][0], { [APP_DEF_ENV_KEY]: 'appId' });
  });
});
