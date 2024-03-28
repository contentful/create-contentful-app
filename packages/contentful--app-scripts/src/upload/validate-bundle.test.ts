import sinon, { SinonStub } from 'sinon';
import proxyquire from 'proxyquire';
import assert from 'assert';
import { UploadSettings } from '../types';

describe('validateBundle', () => {
  beforeEach(() => {
    sinon.stub(console, 'warn');
  });
  afterEach(() => {
    (console.warn as SinonStub).restore();
  });

  it('throws when there is no index.html', () => {
    const fsstub = { readdirSync: () => [] };
    const { validateBundle } = proxyquire('./validate-bundle', { fs: fsstub });
    try {
      validateBundle('build', {});
    } catch (e: any) {
      assert.strictEqual(
        e.message,
        'Make sure your bundle includes a valid index.html file in its root folder.'
      );
    }
  });

  it('warns when the index.html contains an absolute path', () => {
    const fsstub = {
      readdirSync: () => ['index.html'],
      readFileSync: () => '<html><script src="/absolute/path"></script></html>',
    };
    const { validateBundle } = proxyquire('./validate-bundle', { fs: fsstub });
    validateBundle('build', {});
    assert((console.warn as SinonStub).calledWith(sinon.match(/absolute paths/)));
  });

  it('does not warn when the index.html contains only relative paths', () => {
    const fsstub = {
      readdirSync: () => ['index.html'],
      readFileSync: () => '<html><script src="./relative/path"></script></html>',
    };
    const { validateBundle } = proxyquire('./validate-bundle', { fs: fsstub });
    validateBundle('build', {});
    sinon.assert.notCalled(console.warn as SinonStub);
  });

  it('throws when there is no entry point for a function defined in the contentful-app-manifest.json', () => {
    const mockedSettings = {
      functions: [
        { id: 'myFunc', path: 'functions/myFunc.js' },
        { id: 'myOtherFunc', path: 'functions/myOtherFunc.js' },
      ],
    } as Pick<UploadSettings, 'functions' | 'actions'>;
    const fsstub = {
      readdirSync: () => ['index.html', 'functions', 'functions/myFunc.js'],
      readFileSync: () => '<html><script src="./relative/path"></script></html>',
    };
    const { validateBundle } = proxyquire('./validate-bundle', { fs: fsstub });
    try {
      validateBundle('build', mockedSettings);
    } catch (e: any) {
      assert.strictEqual(
        e.message,
        'Function "myOtherFunc" is missing its entry file at "build/functions/myOtherFunc.js".'
      );
    }
  });

  it('throws when there is no entry point for a function defined in the contentful-app-manifest.json', () => {
    const mockedSettings = {
      actions: [
        { id: 'myAction', path: 'actions/myAction.js' },
        { id: 'myOtherAction', path: 'actions/myOtherAction.js' },
      ],
    } as Pick<UploadSettings, 'functions' | 'actions'>;
    const fsstub = {
      readdirSync: () => ['index.html', 'actions', 'actions/myAction.js'],
      readFileSync: () => '<html><script src="./relative/path"></script></html>',
    };
    const { validateBundle } = proxyquire('./validate-bundle', { fs: fsstub });
    try {
      validateBundle('build', mockedSettings);
    } catch (e: any) {
      assert.strictEqual(
        e.message,
        'Action "myOtherAction" is missing its entry file at "build/actions/myOtherAction.js".'
      );
    }
  });
});
