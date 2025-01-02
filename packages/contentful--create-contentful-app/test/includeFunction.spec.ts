import { expect } from 'chai';
import { rimraf } from 'rimraf';
import sinon from 'sinon';
import { functionTemplateFromName } from '../src/includeFunction';

describe('includeFunction', () => {
  describe('functionTemplateFromName', () => {
    let stubbedRimraf: sinon.SinonStub;
    beforeEach(() => {
      stubbedRimraf = sinon.stub(rimraf, 'sync');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return the correct function template when given a valid template name', () => {
      const functionTemplate = functionTemplateFromName(
        'appevent-filter',
        '/Users/person/dev/my-app'
      );
      expect(functionTemplate).to.equal('appevent-filter');
    });

    it('should return the correct function template when given the legacy external-references name', () => {
      const functionTemplate = functionTemplateFromName(
        'external-references',
        '/Users/person/dev/my-app'
      );
      expect(functionTemplate).to.equal('templates');
    });

    it('should throw an error with an invalid function template name', () => {
      try {
        functionTemplateFromName('nope', '/Users/person/dev/my-app');
      } catch (error) {
        expect(error.message).to.contain('Invalid function template:');
      }
      sinon.assert.calledOnce(stubbedRimraf);
    });
  });
});
