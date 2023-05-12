const assert = require('assert');

const { isValidIpAddress, removeProtocolFromUrl } = require('./utils');

describe('isValidIpAddress', () => {
  it('returns true for a valid IP address', () => {
    const result = isValidIpAddress('192.168.0.1');
    assert.strictEqual(result, true);
  });

  it('returns true for a valid domain', () => {
    const result = isValidIpAddress('google.com');
    assert.strictEqual(result, true);
  });

  it('returns true for a valid ipv6 address', () => {
    const result = isValidIpAddress('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
    assert.strictEqual(result, true);
  });

  it('returns true for a valid domain with port', () => {
    const result = isValidIpAddress('google.com:4000');
    assert.strictEqual(result, true);
  });

  it('returns true for a valid IP address with port', () => {
    const result = isValidIpAddress('192.168.0.1:2000');
    assert.strictEqual(result, true);
  });

  it('returns false for an invalid IP address', () => {
    const result = isValidIpAddress('not an ip address');
    assert.strictEqual(result, false);
  });

  it('returns true for an valid ipv6 address with port', () => {
    const result = isValidIpAddress('[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:443');
    assert.strictEqual(result, true);
  });
});

describe('removeProtocolFromUrl', () => {
  it('returns the host of a URL without a protocol', () => {
    const result = removeProtocolFromUrl('http://example.com');
    assert.strictEqual(result, 'example.com');
  });

  it('returns undefined for an invalid URL', () => {
    const result = removeProtocolFromUrl('not a url');
    assert.strictEqual(result, undefined);
  });

  it('returns valid ipv6 address', () => {
    const result = removeProtocolFromUrl('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
    assert.strictEqual(result, '[2001:db8:85a3::8a2e:370:7334]');
  });

  it('returns valid domain', () => {
    const result = removeProtocolFromUrl('example.com');
    assert.strictEqual(result, 'example.com');
  });

  it('returns valid domain with port', () => {
    const result = removeProtocolFromUrl('example.com:40');
    assert.strictEqual(result, 'example.com:40');
  });
});
