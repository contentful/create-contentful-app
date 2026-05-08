import { expect } from 'chai';
import inquirer from 'inquirer';
import sinon from 'sinon';
import { EXAMPLES_PATH } from '../src/constants';
import * as getGithubFolderNamesModule from '../src/getGithubFolderNames';
import { getTemplateSource, makeContentfulExampleSource } from '../src/getTemplateSource';
import { ContentfulExample, InvalidTemplateError } from '../src/types';

describe('getTemplateSource', () => {
  describe('makeContentfulExampleSource', () => {
    let getGithubFolderNamesStub;
    let promptStub;

    beforeEach(() => {
      getGithubFolderNamesStub = sinon.stub(getGithubFolderNamesModule, 'getGithubFolderNames');
      promptStub = sinon.stub(inquirer, 'prompt');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return template source with valid example template', async () => {
      getGithubFolderNamesStub.resolves(['home-location', 'page-location']);

      const templateSource = await makeContentfulExampleSource({ example: 'home-location' });
      expect(templateSource).to.equal(`${EXAMPLES_PATH}home-location`);
    });

    it('should throw an error with invalid example template', async () => {
      getGithubFolderNamesStub.resolves(['home-location', 'page-location']);

      try {
        const templateSource = await makeContentfulExampleSource({ example: 'invalid' });
        console.log(templateSource);
      } catch (error) {
        expect(error instanceof InvalidTemplateError).to.be.true;
      }
    });

    it('should return template source with valid javascript template option', async () => {
      const templateSource = await makeContentfulExampleSource({ javascript: true });
      expect(templateSource).to.equal(`${EXAMPLES_PATH}${ContentfulExample.Javascript}`);
    });

    it('should return template source with valid typescript template option', async () => {
      const templateSource = await makeContentfulExampleSource({ typescript: true });
      expect(templateSource).to.equal(`${EXAMPLES_PATH}${ContentfulExample.Typescript}`);
    });

    it('should return typescript template source with function option', async () => {
      const templateSource = await makeContentfulExampleSource({ function: 'function-appaction' });
      expect(templateSource).to.equal(`${EXAMPLES_PATH}${ContentfulExample.Typescript}`);
    });

    it('should return typescript template source with action option', async () => {
      const templateSource = await makeContentfulExampleSource({ function: true });
      expect(templateSource).to.equal(`${EXAMPLES_PATH}${ContentfulExample.Typescript}`);
    });

    it('should return prompt example selection if no options are provided', async () => {
      promptStub.resolves({ starter: 'template', language: 'vite-react' });
      const templateSource = await makeContentfulExampleSource({});
      expect(templateSource).to.equal(`${EXAMPLES_PATH}vite-react`);
    });
  });

  describe('getTemplateSource', async () => {
    let consoleLogSpy;

    beforeEach(() => {
      consoleLogSpy = sinon.spy(console, 'log');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return source without a warning when it is a Contentful template', async () => {
      const source = `${EXAMPLES_PATH}${ContentfulExample.Typescript}`;
      const sourceResult = await getTemplateSource({ source });
      expect(sourceResult).to.equal(source);
      expect(consoleLogSpy.calledOnce).to.be.false;
    });

    it('should provide warning if source is not a Contentful template', async () => {
      const source = 'my-source';
      const sourceResult = await getTemplateSource({ source });
      expect(sourceResult).to.equal(source);
      expect(consoleLogSpy.getCall(0).args[0]).to.include('Warning');
    });
  });
});
