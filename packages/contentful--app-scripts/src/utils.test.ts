import assert from 'assert';
import { SinonStub, stub } from 'sinon';
import proxyquire from 'proxyquire';

import { getWebAppHostname, isValidNetwork, stripProtocol } from './utils';
import { DEFAULT_CONTENTFUL_APP_HOST } from './constants';

describe('isValidIpAddress', () => {
  it('returns true for a valid IP address', () => {
    const result = isValidNetwork('192.168.0.1');
    assert.strictEqual(result, true);
  });

  it('returns true for a wildcard domain address', () => {
    const result = isValidNetwork('*.cloudflare.com');
    assert.strictEqual(result, true);
  });

  it('returns true for a valid domain', () => {
    const result = isValidNetwork('google.com');
    assert.strictEqual(result, true);
  });

  it('returns true for a valid ipv6 address', () => {
    const result = isValidNetwork('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
    assert.strictEqual(result, true);
  });

  it('returns true for a valid domain with port', () => {
    const result = isValidNetwork('google.com:4000');
    assert.strictEqual(result, true);
  });

  it('returns true for a valid IP address with port', () => {
    const result = isValidNetwork('192.168.0.1:2000');
    assert.strictEqual(result, true);
  });

  it('returns false for an invalid IP address', () => {
    const result = isValidNetwork('not an ip address');
    assert.strictEqual(result, false);
  });

  it('returns false for an invalid IP address', () => {
    const result = isValidNetwork('427.0.0.1');
    assert.strictEqual(result, false);
  });

  it('returns true for an valid ipv6 address with port', () => {
    const result = isValidNetwork('[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:443');
    assert.strictEqual(result, true);
  });

  it('returns false for an invalid wildcard domain address', () => {
    const result = isValidNetwork('*.128.0.1');
    assert.strictEqual(result, false);
  });

  it('returns false for invalid wildcard domain address', () => {
    const result = isValidNetwork('*.com');
    assert.strictEqual(result, false);
  });

  it('returns false for invalid wildcard domain address', () => {
    const result = isValidNetwork('*.too.example.com');
    assert.strictEqual(result, false);
  });

  it('returns false for invalid wildcard domain address', () => {
    const result = isValidNetwork('*');
    assert.strictEqual(result, false);
  });
});

describe('removeProtocolFromUrl', () => {
  it('returns the host of a URL without a protocol', () => {
    const result = stripProtocol('http://example.com');
    assert.strictEqual(result, 'example.com');
  });

  it('returns valid ipv6 address', () => {
    const result = stripProtocol('http://[2001:0db8:85a3:0000:0000:8a2e:0370]:7334');
    assert.strictEqual(result, '[2001:0db8:85a3:0000:0000:8a2e:0370]:7334');
  });

  it('returns valid domain', () => {
    const result = stripProtocol('example.com');
    assert.strictEqual(result, 'example.com');
  });

  it('returns valid domain with port', () => {
    const result = stripProtocol('example.com:40');
    assert.strictEqual(result, 'example.com:40');
  });
});

describe('get functions from manifest', () => {
  let exitStub: SinonStub, consoleLog: SinonStub;

  const functionMock = {
    id: 'test',
    name: 'name',
    description: 'description',
    path: 'functions/mock.js',
    entryFile: './functions/mock.ts',
    allowNetworks: ['127.0.0.1', 'some.domain.tld'],
    accepts: ['graphql.field.mapping', 'graphql.query', 'appevent.filter'],
  };
  // eslint-disable-next-line no-unused-vars
  const { entryFile: _, ...resultMock } = functionMock;

  const fs = {
    existsSync: stub(),
    readFileSync: stub(),
  };
  const chalk = {
    bold: stub(),
    red: stub(),
  };

  const { getFunctionsFromManifest } = proxyquire('./utils', { fs, chalk });

  beforeEach(() => {
    exitStub = stub(process, 'exit');
    consoleLog = stub(console, 'log');
  });
  afterEach(() => {
    exitStub.restore();
    consoleLog.restore();
  });

  it('should return undefined if manifest does not exist', () => {
    fs.existsSync.returns(false);

    const result = getFunctionsFromManifest();

    assert.equal(result, undefined);
  });

  it('should return undefined if manifest has no functions', () => {
    fs.existsSync.returns(true);
    fs.readFileSync.returns(JSON.stringify({ functions: [] }));

    const result = getFunctionsFromManifest();
    assert.equal(result, undefined);
  });

  it('should return an array of functions if manifest is valid', () => {
    fs.existsSync.returns(true);
    fs.readFileSync.returns(
      JSON.stringify({
        functions: [functionMock],
      })
    );

    const result = getFunctionsFromManifest();

    assert.deepEqual(result, [resultMock]);
    assert.ok(consoleLog.called);
  });

  it('should strip the protocol when a domain has a protocol in allowNetworks', () => {
    const mockFn = {
      ...functionMock,
      allowNetworks: ['http://some.domain.tld'],
    };
    // eslint-disable-next-line no-unused-vars
    const { entryFile: _, ...resultMock } = mockFn;
    fs.existsSync.returns(true);
    fs.readFileSync.returns(
      JSON.stringify({
        functions: [mockFn],
      })
    );

    const result = getFunctionsFromManifest();

    assert.deepEqual(result, [{ ...resultMock, allowNetworks: ['some.domain.tld'] }]);
    assert.ok(consoleLog.called);
  });

  it('should return an array of functions without entryFile prop if manifest is valid', () => {
    fs.existsSync.returns(true);
    fs.readFileSync.returns(
      JSON.stringify({
        functions: [functionMock],
      })
    );

    const result = getFunctionsFromManifest();

    assert.notDeepEqual(result, [functionMock]);
  });

  it('should exit with error if invalid network is found in allowNetworks', () => {
    fs.existsSync.returns(true);
    fs.readFileSync.returns(
      JSON.stringify({
        functions: [
          {
            name: 'test resolver fn',
            entryFile: 'entry1',
            allowNetworks: ['412.1.1.1'],
          },
        ],
      })
    );

    getFunctionsFromManifest();

    assert.ok(exitStub.calledOnceWith(1));
  });

  it('should exit with error if the is an invalid event', () => {
    fs.existsSync.returns(true);
    fs.readFileSync.returns(
      JSON.stringify({
        functions: [
          {
            name: 'action1',
            entryFile: 'entry1',
            accepts: ['webhooks.rest'],
          },
        ],
      })
    );

    getFunctionsFromManifest();

    assert.ok(exitStub.calledOnceWith(1));
  });

  it('should exit with error if manifest is invalid JSON', () => {
    fs.existsSync.returns(true);
    fs.readFileSync.throws();

    getFunctionsFromManifest();

    assert.ok(exitStub.calledOnceWith(1));
  });
});

describe('get web app hostname', () => {
  it('should return the default if host is undefined', () => {
    const result = getWebAppHostname(undefined);
    assert.equal(result, DEFAULT_CONTENTFUL_APP_HOST);
  });

  it('should return the host with app subdomain', () => {
    const result = getWebAppHostname('api.contentful.com');
    assert.equal(result, DEFAULT_CONTENTFUL_APP_HOST);
  });

  it('should return the host with app subdomain for EU', () => {
    const result = getWebAppHostname('api.eu.contentful.com');
    assert.equal(result, 'app.eu.contentful.com');
  });
});
