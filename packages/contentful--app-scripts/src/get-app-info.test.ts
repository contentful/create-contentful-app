const { stub } = require('sinon');
const proxyquire = require('proxyquire');
const assert = require('assert');

describe('get-app-info', () => {
  let getAppInfo, stubs;
  const mockedSettings = {
    token: 'token',
    organizationId: 'test-id',
    definitionId: 'test-id',
  };

  beforeEach(() => {
    stubs = {
      getDefinitionByIdStub: stub().returns({ value: 'id' }),
      selectDefinitionStub: stub().returns({ value: 'id' }),
      getOrganizationByIdStub: stub().returns({ value: 'id' }),
      selectOrganizationStub: stub().returns({ value: 'id' }),
    };
    ({ getAppInfo } = proxyquire('./get-app-info', {
      './definition-api': {
        getDefinitionById: stubs.getDefinitionByIdStub,
        selectDefinition: stubs.selectDefinitionStub,
      },
      './organization-api': {
        getOrganizationById: stubs.getOrganizationByIdStub,
        selectOrganization: stubs.selectOrganizationStub,
      },
      inquirer: {
        prompt: stub(),
      },
      './get-management-token': {
        getManagementToken: stub(),
      },
    }));
  });
  it('calls select Organization when id not provided', async () => {
    await getAppInfo({ ...mockedSettings, organizationId: undefined });
    assert.strictEqual(stubs.selectOrganizationStub.called, true);
    assert.strictEqual(stubs.getOrganizationByIdStub.called, false);
  });
  it('calls getOrganizationById when id provided', async () => {
    await getAppInfo(mockedSettings);
    assert.strictEqual(stubs.selectDefinitionStub.called, false);
    assert.strictEqual(stubs.getDefinitionByIdStub.called, true);
  });
  it('calls select Definition when id not provided', async () => {
    await getAppInfo({ ...mockedSettings, definitionId: undefined });
    assert.strictEqual(stubs.selectDefinitionStub.called, true);
    assert.strictEqual(stubs.getDefinitionByIdStub.called, false);
  });
  it('calls getDefinitionById when id provided', async () => {
    await getAppInfo(mockedSettings);
    assert.strictEqual(stubs.selectDefinitionStub.called, false);
    assert.strictEqual(stubs.getDefinitionByIdStub.called, true);
  });
});
