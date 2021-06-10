const sinon = require('sinon');
const proxyquire = require('proxyquire');
const assert = require('assert');

describe('validateBundle', () => {
  beforeEach(() => {
    sinon.stub(console, 'warn');
  });
  afterEach(() => {
    console.warn.restore();
  });

  it('throws when there is no index.html', () => {
    const fsstub = { readdirSync: () => [] };
    const { validateBundle } = proxyquire('./validate-bundle', { fs: fsstub });
    try {
      validateBundle('build');
    } catch (e) {
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
    validateBundle('build');
    assert(console.warn.calledWith(sinon.match(/absolute paths/)));
  });

  it('does not warn when the index.html contains only relative paths', () => {
    const fsstub = {
      readdirSync: () => ['index.html'],
      readFileSync: () => '<html><script src="./relative/path"></script></html>',
    };
    const { validateBundle } = proxyquire('./validate-bundle', { fs: fsstub });
    validateBundle('build');
    sinon.assert.notCalled(console.warn)
  });
});
