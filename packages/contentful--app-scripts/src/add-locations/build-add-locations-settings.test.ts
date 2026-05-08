import sinon from 'sinon';
import inquirer from 'inquirer';
import { expect } from 'chai';
import { buildAddLocationsSettings, hostProtocolFilter } from './build-add-locations-settings';
import { DEFAULT_CONTENTFUL_API_HOST } from '../constants';
import * as getAppInfoModule from '../get-app-info';

describe('buildAddLocationsSettings', () => {
    let promptStub: sinon.SinonStub;
    let getAppInfoStub: sinon.SinonStub;

    beforeEach(() => {
        promptStub = sinon.stub(inquirer, 'prompt');
        getAppInfoStub = sinon.stub(getAppInfoModule, 'getAppInfo');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should use the default host if none is provided', async () => {
        getAppInfoStub.resolves({ definition: { locations: [] } });
        promptStub.resolves({ host: DEFAULT_CONTENTFUL_API_HOST });

        const result = await buildAddLocationsSettings({});

        expect(result.host).to.equal(DEFAULT_CONTENTFUL_API_HOST);
    });

    it('should prompt for locations if there are possible locations to add', async () => {
        getAppInfoStub.resolves({ definition: { locations: [] } });
        promptStub.onFirstCall().resolves({ host: DEFAULT_CONTENTFUL_API_HOST });
        promptStub.onSecondCall().resolves({ locations: ['entry-field'] });

        const result = await buildAddLocationsSettings({});

        expect(result.host).to.equal(DEFAULT_CONTENTFUL_API_HOST);
        expect(promptStub.callCount).to.be.greaterThan(1);
    });

    it('should exit if there are no locations to add', async () => {
        getAppInfoStub.resolves({ definition: { locations: ['entry-field'] } });
        promptStub.onFirstCall().resolves({ host: DEFAULT_CONTENTFUL_API_HOST });
        sinon.stub(process, 'exit').callsFake((code) => {
            throw new Error(`process.exit(${code})`);
        });

        try {
            await buildAddLocationsSettings({});
        } catch (err) {
            expect(err.message).to.equal('process.exit(1)');
        }
    });

    it('should filter out the protocol from the host input', () => {
        const input = 'https://example.com';
        const result = hostProtocolFilter(input);
        expect(result).to.equal('example.com');
    });

    it('should include additional prompts for "entry-field" and "page" locations', async () => {
        getAppInfoStub.resolves({ definition: { locations: [] } });
        promptStub.onFirstCall().resolves({ host: DEFAULT_CONTENTFUL_API_HOST });
        promptStub.onSecondCall().resolves({
            locations: ['entry-field', 'page'],
            fields: ['field1'],
            pageNav: 'Main',
            pageNavLinkName: 'Link Name',
            pageNavLinkPath: '/path',
        });

        const result = await buildAddLocationsSettings({});

        expect(result.host).to.equal(DEFAULT_CONTENTFUL_API_HOST);
        expect(result.fields).to.deep.equal(['field1']);
        expect(result.pageNav).to.equal('Main');
        expect(result.pageNavLinkName).to.equal('Link Name');
        expect(result.pageNavLinkPath).to.equal('/path');
    });
});
