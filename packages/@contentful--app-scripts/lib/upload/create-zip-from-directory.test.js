const util = require('util');
const fs = require('fs');
const path = require('path');
const os = require('os');
const assert = require('assert');
const JSZip = require('jszip');
const { addFilesToZip } = require('./create-zip-from-directory');
const { convertPathToFileData } = require('./create-zip-from-directory');

describe('create-zip-from-directory', () => {
  describe('convertPathToFileData', () => {
    let pathname;
    const fileContent = 'test';
    before(function (done) {
      const filename = util.format('io-testfile-mocha-%s.txt', process.pid);
      pathname = path.join(os.tmpdir(), filename);
      fs.writeFile(pathname, fileContent, function (err) {
        if (err) {
          return done(err);
        }
        done();
      });
    });
    it('converts file in correct format', async () => {
      const fileData = await convertPathToFileData(pathname);
      assert.strictEqual(fileData[0], pathname);
      assert.strictEqual(fileData[1], fileContent);
    });
  });
  describe('addFilesToZip', () => {
    let zip;
    let selectedDirectory = './root';
    const files = [
      ['./root/path/file.js', 'content'],
      ['./root/path/index.js', 'content'],
      ['./root/index.html', 'content'],
    ];
    beforeEach(function () {
      zip = new JSZip();
    });

    it('files are included in zip and root directory is skipped', async () => {
      const newZip = addFilesToZip(files, zip, selectedDirectory);
      assert.strictEqual(Object.keys(newZip.files).length, 4);
      Object.keys(newZip.files).forEach((path) => {
        assert.strictEqual(path.startsWith(selectedDirectory), false);
      });
    });
    it('works with current directory as selected directory', async () => {
      selectedDirectory = '.';
      const newZip = addFilesToZip(files, zip, selectedDirectory);
      assert.strictEqual(Object.keys(newZip.files).length, 5);
      Object.keys(newZip.files).forEach((path) => {
        assert.strictEqual(path.startsWith(selectedDirectory), false);
      });
    });
  });
});
