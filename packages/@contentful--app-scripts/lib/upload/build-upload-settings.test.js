const { stub } = require('sinon');
const proxyquire = require('proxyquire');
const assert = require('assert');

describe('build-upload-settings', () => {
  let buildAppUploadSettings, stubs;
  const mockedSettings = {
    token: 'token',
    organizationId: 'test-id',
    definitionId: 'test-id',
  };

  beforeEach(() => {
    stubs = {
      getDefinitionByIdStub: stub().returns({ value: 'id' }),
      selectDefinitionStub: stub().returns({ value: 'id' }),
      getOrganisationByIdStub: stub().returns({ value: 'id' }),
      selectOrganisationStub: stub().returns({ value: 'id' }),
    };
    ({ buildAppUploadSettings } = proxyquire('./build-upload-settings', {
      '../definition-api': {
        getDefinitionById: stubs.getDefinitionByIdStub,
        selectDefinition: stubs.selectDefinitionStub,
      },
      '../organization-api': {
        getOrganizationById: stubs.getOrganisationByIdStub,
        selectOrganization: stubs.selectOrganisationStub,
      },
      inquirer: {
        prompt: stub(),
      },
      '../get-management-token': {
        getManagementToken: stub(),
      },
    }));
  });
  it('calls select Organisation when id not provided', async () => {
    await buildAppUploadSettings({ ...mockedSettings, organizationId: undefined });
    assert.strictEqual(stubs.selectOrganisationStub.called, true);
    assert.strictEqual(stubs.getOrganisationByIdStub.called, false);
  });
  it('calls getOrganizationById when id provided', async () => {
    await buildAppUploadSettings(mockedSettings);
    assert.strictEqual(stubs.selectDefinitionStub.called, false);
    assert.strictEqual(stubs.getDefinitionByIdStub.called, true);
  });
  it('calls select Definition when id not provided', async () => {
    await buildAppUploadSettings({ ...mockedSettings, definitionId: undefined });
    assert.strictEqual(stubs.selectDefinitionStub.called, true);
    assert.strictEqual(stubs.getDefinitionByIdStub.called, false);
  });
  it('calls getDefinitionById when id provided', async () => {
    await buildAppUploadSettings(mockedSettings);
    assert.strictEqual(stubs.selectDefinitionStub.called, false);
    assert.strictEqual(stubs.getDefinitionByIdStub.called, true);
  });
});
