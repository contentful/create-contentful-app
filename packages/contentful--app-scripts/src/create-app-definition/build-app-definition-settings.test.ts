import sinon from 'sinon';
import inquirer from 'inquirer';
import { buildAppDefinitionSettings } from './build-app-definition-settings';
import { DEFAULT_CONTENTFUL_API_HOST } from '../constants';

describe('buildAppDefinitionSettings', async () => {
  let chai: Chai.ChaiStatic;
  let promptStub: sinon.SinonStub;

  beforeEach(async () => {
    promptStub = sinon.stub(inquirer, 'prompt');
    chai = await import('chai');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should add app definition settings correctly', async () => {
    promptStub.onCall(0).resolves({
      name: 'My custom app',
      locations: ['app-config'],
      host: DEFAULT_CONTENTFUL_API_HOST,
      buildAppParameters: false,
    });

    const appDefinitionSettings = await buildAppDefinitionSettings();

    chai.expect(appDefinitionSettings).to.deep.equal({
      name: 'My custom app',
      locations: ['dialog', 'app-config'],
      host: DEFAULT_CONTENTFUL_API_HOST,
      buildAppParameters: false,
    });
  });

  it('should handle entry-field and field type selection correctly', async () => {
    promptStub.onCall(0).resolves({
      name: 'My custom app',
      locations: ['entry-field'],
      host: DEFAULT_CONTENTFUL_API_HOST,
      buildAppParameters: false,
      fields: [{ type: 'Symbol' }],
    });

    const appDefinitionSettings = await buildAppDefinitionSettings();

    chai.expect(appDefinitionSettings).to.deep.equal({
      name: 'My custom app',
      locations: ['dialog', 'entry-field'],
      host: DEFAULT_CONTENTFUL_API_HOST,
      buildAppParameters: false,
      fields: [{ type: 'Symbol' }],
    });
  });

  it('should handle page and pageNav selection correctly', async () => {
    promptStub.onCall(0).resolves({
      name: 'My custom app',
      locations: ['page'],
      host: DEFAULT_CONTENTFUL_API_HOST,
      buildAppParameters: false,
      pageNav: true,
      pageNavLinkName: 'My custom link',
      pageNavLinkPath: '/my-custom-link',
    });

    const appDefinitionSettings = await buildAppDefinitionSettings();

    chai.expect(appDefinitionSettings).to.deep.equal({
      name: 'My custom app',
      locations: ['dialog', 'page'],
      host: DEFAULT_CONTENTFUL_API_HOST,
      buildAppParameters: false,
      pageNav: true,
      pageNavLinkName: 'My custom link',
      pageNavLinkPath: '/my-custom-link',
    });
  });
});
