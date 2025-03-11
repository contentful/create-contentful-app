import sinon, { SinonStub } from 'sinon';
import proxyquire from 'proxyquire';
import assert from 'assert';
import { UploadSettings } from '../types';
import path from 'node:path';

describe('validateBundle', () => {
  beforeEach(() => {
    sinon.stub(console, 'warn');
  });
  afterEach(() => {
    (console.warn as SinonStub).restore();
  });

  it('throws when there is no index.html & no functions or actions', () => {
    const fsstub = { readdirSync: () => [] };
    const { validateBundle } = proxyquire('./validate-bundle', { 'node:fs': fsstub });
    try {
      validateBundle('build', {});
    } catch (e: any) {
      assert.strictEqual(
        e.message,
        'Ensure your bundle includes a valid index.html file in its root folder, or a valid Contentful Function entrypoint (defined in your contentful-app-manifest.json file).'
      );
    }
  });
  it('does not throw when there is no index.html but a function is defined', () => {
    const mockedSettings = {
      functions: [{ id: 'myFunc', path: 'functions/myFunc.js' }],
    } as Pick<UploadSettings, 'functions'>;
    const fsstub = {
      readdirSync: () => ['functions', path.join('functions', 'myFunc.js')],
    };
    const { validateBundle } = proxyquire('./validate-bundle', { 'node:fs': fsstub });
    validateBundle('build', mockedSettings);
  });

  it('warns when the index.html contains an absolute path', () => {
    const fsstub = {
      readdirSync: () => ['index.html'],
      readFileSync: () => '<html><script src="/absolute/path"></script></html>',
    };
    const { validateBundle } = proxyquire('./validate-bundle', { 'node:fs': fsstub });
    validateBundle('build', {});
    assert((console.warn as SinonStub).calledWith(sinon.match(/absolute paths/)));
  });

  it('does not warn when the index.html contains only relative paths', () => {
    const fsstub = {
      readdirSync: () => ['index.html'],
      readFileSync: () => '<html><script src="./relative/path"></script></html>',
    };
    const { validateBundle } = proxyquire('./validate-bundle', { 'node:fs': fsstub });
    validateBundle('build', {});
    sinon.assert.notCalled(console.warn as SinonStub);
  });

  it('throws when there is no entry point for a function defined in the contentful-app-manifest.json', () => {
    const mockedSettings = {
      functions: [
        { id: 'myFunc', path: 'functions/myFunc.js' },
        { id: 'myOtherFunc', path: 'functions/myOtherFunc.js' },
      ],
    } as Pick<UploadSettings, 'functions'>;
    const fsstub = {
      readdirSync: () => ['index.html', 'functions', path.join('functions', 'myFunc.js')],
      readFileSync: () => '<html><script src="./relative/path"></script></html>',
    };
    const { validateBundle } = proxyquire('./validate-bundle', { 'node:fs': fsstub });
    try {
      validateBundle('build', mockedSettings);
    } catch (e: any) {
      assert.strictEqual(
        e.message,
        `Function "myOtherFunc" is missing its entry file at "${path.join('build', 'functions', 'myOtherFunc.js')}".`
      );
    }
  });
});
