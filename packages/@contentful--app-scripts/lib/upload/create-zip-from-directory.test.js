const assert = require('assert');
const AdmZip = require('adm-zip');
const { stub, match } = require('sinon');
const { createZipFileFromDirectory } = require('./create-zip-from-directory');

describe('createZipFileFromDirectory', () => {
  beforeEach(() => {
    stub(console, 'log');
  });

  afterEach(() => {
    console.log.restore();
  });

  it('successfully creates a zip from path', async () => {
    const zip = await createZipFileFromDirectory('./fixtures/test-bundle');
    const admZip = new AdmZip(zip);
    assert(console.log.calledWith(match(/successfully zipped/)));
    assert.strictEqual(admZip.getEntries().length, 4);
  });

  it('shows error and return null when something went wrong', async () => {
    const zip = await createZipFileFromDirectory('./fixtures/test-bundle/does-not-exist');
    assert(console.log.calledWith(match(/Creation error:/)));
    assert.strictEqual(zip, null);
  });
});
