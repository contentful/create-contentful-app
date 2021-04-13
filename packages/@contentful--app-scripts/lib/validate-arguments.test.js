const assert = require('assert');
const { validateArguments } = require('./validate-arguments');
const { stub } = require('sinon');

describe('validateArguments', () => {
  const options = {
    firstKey: 'anything',
    secondKey: 'anything',
  };
  const requiredOptions = {
    firstKey: '--anything',
    secondKey: '--anything',
    thirdKey: '--anything',
  };

  beforeEach(() => {
    stub(console, 'log');
  });

  afterEach(() => {
    console.log.restore();
  });

  it('throws an error when options does not contain requiredOptions', () => {
    const throwing = () => validateArguments(requiredOptions, options);
    assert.throws(throwing, Error);
  });

  it('does not throw an error when options does contain requiredOptions', () => {
    const throwing = () => validateArguments(requiredOptions, { ...options, thirdKey: 'anything' });
    assert.doesNotThrow(throwing, Error);
  });
});
