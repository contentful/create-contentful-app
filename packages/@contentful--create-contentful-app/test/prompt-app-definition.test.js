const proxyquire = require('proxyquire');
const { stub } = require('sinon');
const assert = require('assert');

const makeTestSubject = (prompt = stub()) => {
  return proxyquire('../lib/prompt-app-definition', {
    inquirer: { prompt },
  });
};

describe('promptAppDefinition', () => {
  beforeEach(() => {
    stub(process, 'exit');
    stub(console, 'log');
  });

  afterEach(() => {
    process.exit.restore();
    console.log.restore();
  });

  it('links to relevant documentation', async () => {
    const appDefinitionLink = 'https://ctfl.io/app-definitions';
    const appLocationsLink = 'https://ctfl.io/app-locations';

    const promptStub = stub().returns({ locations: [] });
    const promptAppDefinition = makeTestSubject(promptStub);

    await promptAppDefinition();

    const loggedMessage = console.log.getCall(0).args[0];

    assert(loggedMessage.includes(appDefinitionLink));
    assert(loggedMessage.includes(appLocationsLink));
  });
});
