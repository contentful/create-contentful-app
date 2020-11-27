const proxyquire = require('proxyquire');
const { stub, match } = require('sinon');
const assert = require('assert');

const makeTestSubject = (login = stub(), client = {}, prompt = stub()) => {
  return proxyquire('../lib/create-app-definition', {
    './login': login,
    inquirer: { prompt },
    'contentful-management': {
      createClient: () => {
        return client;
      }
    }
  });
};

describe('createAppDefinition', () => {
  beforeEach(() => {
    stub(process, 'exit');
    stub(console, 'log');
  });

  afterEach(() => {
    process.exit.restore();
    console.log.restore();
  });

  it('exits when unable to login', async () => {
    const login = stub().throws(new Error());
    const createAppDefinition = makeTestSubject(login);

    await createAppDefinition();

    assert(process.exit.called);
  });

  it('exits when unable to fetch organizations', async () => {
    const login = stub();
    const client = {
      getOrganizations: stub().rejects(new Error())
    };
    const createAppDefinition = makeTestSubject(login, client);

    await createAppDefinition();

    assert(console.log.calledWith(match(/Could not fetch your organizations/)));
    assert(process.exit.called);
  });

  it('exits when unable to create app definition', async () => {
    const organizationId = 'orgid';
    const login = stub();
    const client = {
      getOrganization: stub().resolves({ createAppDefinition: stub().rejects(new Error()) }),
      getOrganizations: stub().resolves({ items: [{ name: 'name', sys: { id: organizationId } }] })
    };
    const prompt = stub().returns({ organizationId });
    const createAppDefinition = makeTestSubject(login, client, prompt);

    await createAppDefinition({ locations: [] });

    assert(console.log.calledWith(match(/Something went wrong while creating the app definition/)));
    assert(process.exit.called);
  });

  it('logs the success message', async () => {
    const organizationId = 'orgid';
    const appId = 'appId';
    const orgSettingsLink = 'https://app.contentful.com/deeplink?link=org';
    const appLink = `https://app.contentful.com/deeplink?link=apps&id=${appId}`;
    const tutorialLink = 'https://ctfl.io/app-tutorial';

    const login = stub();
    const client = {
      getOrganization: stub().resolves({
        createAppDefinition: stub().resolves({ sys: { id: 'appId' } })
      }),
      getOrganizations: stub().resolves({ items: [{ name: 'name', sys: { id: organizationId } }] })
    };
    const prompt = stub().returns({ organizationId });
    const createAppDefinition = makeTestSubject(login, client, prompt);

    await createAppDefinition({ locations: [] });

    const loggedMessage = console.log.getCall(0).args[0];

    assert(loggedMessage.includes('Success'));
    assert(loggedMessage.includes(orgSettingsLink));
    assert(loggedMessage.includes(appLink));
    assert(loggedMessage.includes(tutorialLink));
    assert(!process.exit.called);
  });
});
