import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert';
import sinon from 'sinon';
import * as fileUtils from './utils/file';
import * as logger from './logger'
import {
  getCloneURL,
  touchupAppManifest,
  moveFilesToFinalDirectory,
  renameClonedFiles,
  resolvePaths,
  mergeAppManifest,
  updatePackageJsonWithBuild,
} from './clone'; 
import proxyquire from 'proxyquire';

import { REPO_URL, CONTENTFUL_APP_MANIFEST } from './constants';
import { GenerateFunctionSettings } from '../types';

let settings = {
  name: 'myFunction',
  example: 'typescript',
  language: 'typescript'
} as GenerateFunctionSettings;

describe('Helper functions tests', () => {

  describe('getCloneURL', () => {
    it('should return example clone URL', () => {
      const expected = `${REPO_URL}/${settings.example}/${settings.language}`;
      const url = getCloneURL(settings);
      assert.strictEqual(url, expected);
    });
  });

  describe('touchupAppManifest', () => {
    let tempDir, manifestPath;
    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'manifest-test-'));
      manifestPath = path.join(tempDir, CONTENTFUL_APP_MANIFEST);
      // Create a dummy manifest file with one function entry
      const dummyManifest = { functions: [{}] };
      fs.writeFileSync(manifestPath, JSON.stringify(dummyManifest, null, 2), 'utf-8');
    });

    afterEach(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('should update the manifest with new function id, path and entryFile', async () => {
      const renameFile = 'myFunction.ts';
      await touchupAppManifest(tempDir, settings, renameFile);
      const updatedManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const entry = updatedManifest.functions[updatedManifest.functions.length - 1];

      // The id should be the settings.name
      assert.strictEqual(entry.id, settings.name);
      // The path is updated to always have a .js extension
      assert.strictEqual(entry.path, `functions/${renameFile.replace('.ts', '.js')}`);
      // entryFile remains unchanged (uses the original renameFile)
      assert.strictEqual(entry.entryFile, `functions/${renameFile}`);
    });
  });

  describe('moveFilesToFinalDirectory', () => {
    let tmpDir, destDir;
    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'move-test-tmp-'));
      destDir = fs.mkdtempSync(path.join(os.tmpdir(), 'move-test-dest-'));
      // Create a test file in the tmp directory
      fs.writeFileSync(path.join(tmpDir, 'test.txt'), 'sample content', 'utf-8');
    });

    afterEach(() => {
      // Clean up the destination directory (tmpDir is removed by the function)
      fs.rmSync(destDir, { recursive: true, force: true });
    });

    it('should copy files from tmpDir to destDir and remove tmpDir', () => {
      moveFilesToFinalDirectory(tmpDir, destDir);
      // File should now exist in the destination
      const movedFile = path.join(destDir, 'test.txt');
      assert.ok(fs.existsSync(movedFile));
      // tmpDir should have been removed
      assert.ok(!fs.existsSync(tmpDir));
    });
  });

  describe('renameClonedFiles', () => {
    let tmpDir;
    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rename-test-'));
    });
    afterEach(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('should find a .ts file and rename it based on settings', () => {
      // Create a dummy file ending with .ts
      const originalName = 'oldFunction.ts';
      const originalFilePath = path.join(tmpDir, originalName);
      fs.writeFileSync(originalFilePath, 'console.log("hello")', 'utf-8');

      const newName = renameClonedFiles(tmpDir, settings);
      const expectedName = `${settings.name}.ts`;
      assert.strictEqual(newName, expectedName);
      assert.ok(fs.existsSync(path.join(tmpDir, expectedName)));
      // Original file should no longer exist
      assert.ok(!fs.existsSync(originalFilePath));
    });

    it('should throw an error if no function file is found', () => {
      settings = { ...settings, language: 'javascript' } as GenerateFunctionSettings;
      assert.throws(() => renameClonedFiles(tmpDir, settings), /No function file found/);
    });
  });

  describe('resolvePaths', () => {
    it('should return correct tmp and functions paths based on localPath', () => {
      const localPath = '/some/local/path';
      const { localTmpPath, localFunctionsPath } = resolvePaths(localPath);
      assert.strictEqual(localTmpPath, path.resolve(`${localPath}/tmp`));
      assert.strictEqual(localFunctionsPath, path.resolve(`${localPath}/functions`));
    });
})

  describe('mergeAppManifest', () => {
    let tempDir, functionsDir;
    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'merge-manifest-test-'));
        functionsDir = fs.mkdtempSync(path.join(tempDir, 'merge-functions-test-'));
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
        fs.rmSync(functionsDir, { recursive: true, force: true });
    });

    it('should create a new manifest if none exists in the local path', async () => {
      const tmpManifest = { functions: [{ id: 'tmpFunction' }] };
      fs.writeFileSync(path.join(functionsDir, CONTENTFUL_APP_MANIFEST), JSON.stringify(tmpManifest, null, 2), 'utf-8');

      sinon.stub(fs, 'writeFileSync').callThrough();

      await mergeAppManifest(tempDir, functionsDir);

      const finalManifestPath = path.join(tempDir, CONTENTFUL_APP_MANIFEST);
      assert.ok(fs.existsSync(finalManifestPath));

      const finalManifest = JSON.parse(fs.readFileSync(finalManifestPath, 'utf-8'));
      assert.strictEqual(finalManifest.functions.length, 1);
      assert.strictEqual(finalManifest.functions[0].id, 'tmpFunction');

      sinon.restore();
    });

    it('should merge function into existing manifest', async () => {
      const existingManifest = { functions: [{ id: 'existingFunction' }] };
      fs.writeFileSync(path.join(tempDir, CONTENTFUL_APP_MANIFEST), JSON.stringify(existingManifest, null, 2), 'utf-8');

      const tmpManifest = { functions: [{ id: 'tmpFunction' }] };
      fs.writeFileSync(path.join(functionsDir, CONTENTFUL_APP_MANIFEST), JSON.stringify(tmpManifest, null, 2), 'utf-8');

      sinon.stub(fs, 'existsSync').returns(true);
      sinon.stub(fs, 'writeFileSync').callThrough();

      await mergeAppManifest(tempDir, functionsDir);

      const finalManifestPath = path.join(tempDir, CONTENTFUL_APP_MANIFEST);
      assert.ok(fs.existsSync(finalManifestPath));

      const finalManifest = JSON.parse(fs.readFileSync(finalManifestPath, 'utf-8'));
      assert.strictEqual(finalManifest.functions.length, 2);
      assert.strictEqual(finalManifest.functions[0].id, 'existingFunction');
      assert.strictEqual(finalManifest.functions[1].id, 'tmpFunction');

      sinon.restore();
    });
  });

  describe('updatePackageJsonWithBuild', () => {
    let tempDir, functionsDir, packageJsonPath, functionsPackageJsonPath;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'update-package-json-test-'));
        functionsDir = fs.mkdtempSync(path.join(tempDir, 'functions'));
        packageJsonPath = path.join(tempDir, 'package.json');
        functionsPackageJsonPath = path.join(functionsDir, 'package.json');

        // Create dummy package.json files
        const dummyPackageJson = { scripts: {} };
        fs.writeFileSync(packageJsonPath, JSON.stringify(dummyPackageJson, null, 2), 'utf-8');
        fs.writeFileSync(functionsPackageJsonPath, JSON.stringify(dummyPackageJson, null, 2), 'utf-8');
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
        fs.rmSync(functionsDir, { recursive: true, force: true });
    });

    it('should update package.json with build command if it exists', async () => {
        const mergeJsonIntoFileSpy = sinon.stub(fileUtils, "mergeJsonIntoFile").resolves()

        await updatePackageJsonWithBuild(tempDir, functionsDir);

        assert.ok(mergeJsonIntoFileSpy);
        assert.ok(mergeJsonIntoFileSpy.calledWith({
            source: functionsPackageJsonPath,
            destination: packageJsonPath,
            mergeFn: sinon.match.func,
        }));

        sinon.restore();
    });

    it('should log a warning if package.json does not exist', async () => {
        const warnStub = sinon.stub(logger, 'warn');
        sinon.stub(fileUtils, 'exists').resolves(false);

        await updatePackageJsonWithBuild(tempDir, functionsDir);

        assert.ok(warnStub.calledOnce);

        warnStub.restore();
        sinon.restore();
    });
  });

  describe('Core cloning functionality', () => {
    let tigedStub;
    let cloneInstanceStub;
    let fsStub;
    let existsStub;
    let loggerStub;
    let whichExistsStub;

    beforeEach(() => {
      // Create stubs for all dependencies
      cloneInstanceStub = {
        clone: sinon.stub().resolves(),
        remove: sinon.stub().resolves()
      };
      
      tigedStub = sinon.stub().returns(cloneInstanceStub);
      
      fsStub = {
        mkdtempSync: fs.mkdtempSync,
        writeFileSync: sinon.stub(),
        readFileSync: sinon.stub(),
        readdirSync: sinon.stub().returns(['index.ts', 'package.json']),
        renameSync: sinon.stub(),
        cpSync: sinon.stub(),
        rmSync: sinon.stub()
      };
      
      existsStub = sinon.stub(fileUtils, 'exists');
      whichExistsStub = sinon.stub(fileUtils, 'whichExists');
      
      loggerStub = {
        highlight: sinon.stub(logger, 'highlight').callsFake(msg => msg),
        error: sinon.stub(logger, 'error'),
        warn: sinon.stub(logger, 'warn')
      };

      // Set default behavior for stubs
      existsStub.withArgs(sinon.match(/package\.json/)).resolves(true);
      existsStub.resolves(false);
      whichExistsStub.resolves(CONTENTFUL_APP_MANIFEST);
      fsStub.readFileSync.returns('{"functions":[{}]}');
    });

    afterEach(() => {
      sinon.restore();
    });

    describe('clone', () => {
      it('should create tiged instance with correct parameters', async () => {
        // Replace the tiged require with our stub
        const { clone } = proxyquire('./clone', {
          tiged: tigedStub
        });
        
        const cloneURL = 'test/repo';
        const localPath = '/test/path';
        
        await clone(cloneURL, localPath);
        
        assert.ok(tigedStub.calledOnce);
        assert.ok(tigedStub.calledWith(cloneURL, { 
          mode: 'tar', 
          disableCache: true, 
          force: true 
        }));
        assert.ok(cloneInstanceStub.clone.calledWith(localPath));
      });
      
      it('should return the tiged instance', async () => {
        const { clone } = proxyquire('./clone', {
          tiged: tigedStub
        });
        
        const result = await clone('url', 'path');
        assert.strictEqual(result, cloneInstanceStub);
      });
    });
  });
});
