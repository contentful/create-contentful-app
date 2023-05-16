const assert = require('assert');

const { isValidNetwork, stripProtocol } = require('./utils');

describe('isValidIpAddress', () => {
  it('returns true for a valid IP address', () => {
    const result = isValidNetwork('192.168.0.1');
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

  it('returns true for an valid ipv6 address with port', () => {
    const result = isValidNetwork('[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:443');
    assert.strictEqual(result, true);
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
