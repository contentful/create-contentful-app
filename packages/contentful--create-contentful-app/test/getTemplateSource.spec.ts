import { expect } from 'chai';
import inquirer from 'inquirer';
import sinon from 'sinon';
import { CURRENT_VERSION, examples_path, templates_path } from '../src/constants';
import * as getGithubFolderNamesModule from '../src/getGithubFolderNames';
import { getPathSource,  generateSource } from '../src/getTemplateSource';
import { ContentfulExample, InvalidTemplateError } from '../src/types';

describe('getPathSource', () => {
  describe('generateSource', () => {
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

      const templateSource = await generateSource({ example: 'home-location' });
      expect(templateSource).to.equal(`${examples_path(CURRENT_VERSION)}home-location`);
    });

    it('should throw an error with invalid example template', async () => {
      getGithubFolderNamesStub.resolves(['home-location', 'page-location']);

      try {
        const templateSource = await generateSource({ example: 'invalid' });
        console.log(templateSource);
      } catch (error) {
        expect(error instanceof InvalidTemplateError).to.be.true;
      }
    });

    it('should return template source with valid javascript template option', async () => {
      const templateSource = await generateSource({ javascript: true });
      expect(templateSource).to.equal(`${templates_path(CURRENT_VERSION)}${ContentfulExample.Javascript}`);
    });

    it('should return template source with valid typescript template option', async () => {
      const templateSource = await generateSource({ typescript: true });
      expect(templateSource).to.equal(`${templates_path(CURRENT_VERSION)}${ContentfulExample.Typescript}`);
    });

    it('should return typescript template source with function option', async () => {
      const templateSource = await generateSource({ function: 'function-appaction' });
      expect(templateSource).to.equal(`${templates_path(CURRENT_VERSION)}${ContentfulExample.Typescript}`);
    });

    it('should return typescript template source with action option', async () => {
      const templateSource = await generateSource({ function: true });
      expect(templateSource).to.equal(`${templates_path(CURRENT_VERSION)}${ContentfulExample.Typescript}`);
    });

    it('should return prompt example selection if no options are provided', async () => {
      getGithubFolderNamesStub.resolves(['home-location', 'page-location']);
      promptStub.resolves({ starter: 'template', language: 'vite-react' });
      const templateSource = await generateSource({});
      expect(templateSource).to.equal(`${templates_path(CURRENT_VERSION)}vite-react`);
    });
  });

  describe('getPathSource', async () => {
    let consoleLogSpy;

    beforeEach(() => {
      consoleLogSpy = sinon.spy(console, 'log');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return source without a warning when it is a Contentful template', async () => {
      const source = `${templates_path(CURRENT_VERSION)}${ContentfulExample.Typescript}`;
      const sourceResult = await getPathSource({ source });
      expect(sourceResult).to.equal(source);
      expect(consoleLogSpy.calledOnce).to.be.false;
    });

    it('should provide warning if source is not a Contentful template', async () => {
      const source = 'my-source';
      const sourceResult = await getPathSource({ source });
      expect(sourceResult).to.equal(source);
      expect(consoleLogSpy.getCall(0).args[0]).to.include('Warning');
    });
  });
});
