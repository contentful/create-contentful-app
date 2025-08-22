/// <reference types="node" />
// The above directive tells TypeScript to include Node.js type definitions (i.e. process)
import { expect } from 'chai';
import {
  detectActivePackageManager,
  getNormalizedPackageManager,
  normalizeOptions,
} from '../src/utils';
import type { CLIOptions, PackageManager } from '../src/types';

describe('utils', () => {
  const packageManagers = ['npm', 'pnpm', 'yarn'];

  describe('detectActivePackageManager', () => {
    let originalNpmExecpath: string | undefined;
    let originalCwd: string;
    let tempDir: string;

    beforeEach(() => {
      originalNpmExecpath = process.env.npm_execpath;
      originalCwd = process.cwd();

      // Create temporary directory for each test
      const fs = require('fs');
      const os = require('os');
      const path = require('path');
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-test-'));
      process.chdir(tempDir);
    });

    afterEach(() => {
      // Restore environment
      if (originalNpmExecpath) {
        process.env.npm_execpath = originalNpmExecpath;
      } else {
        delete process.env.npm_execpath;
      }

      // Restore working directory and cleanup
      process.chdir(originalCwd);
      try {
        const fs = require('fs');
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (error) {
        // Ignore cleanup errors
      }
    });

    describe('lock file detection', () => {
      it('should detect pnpm from pnpm-lock.yaml', () => {
        const fs = require('fs');
        fs.writeFileSync('pnpm-lock.yaml', 'lockfileVersion: 5.4');
        expect(detectActivePackageManager()).to.equal('pnpm');
      });

      it('should detect yarn from yarn.lock', () => {
        const fs = require('fs');
        fs.writeFileSync('yarn.lock', '# yarn lockfile v1');
        expect(detectActivePackageManager()).to.equal('yarn');
      });

      it('should detect npm from package-lock.json', () => {
        const fs = require('fs');
        fs.writeFileSync('package-lock.json', '{"lockfileVersion": 2}');
        expect(detectActivePackageManager()).to.equal('npm');
      });

      it('should prioritize pnpm-lock.yaml over other lock files', () => {
        const fs = require('fs');
        fs.writeFileSync('pnpm-lock.yaml', 'lockfileVersion: 5.4');
        fs.writeFileSync('yarn.lock', '# yarn lockfile v1');
        fs.writeFileSync('package-lock.json', '{"lockfileVersion": 2}');
        expect(detectActivePackageManager()).to.equal('pnpm');
      });

      it('should prioritize yarn.lock over package-lock.json', () => {
        const fs = require('fs');
        fs.writeFileSync('yarn.lock', '# yarn lockfile v1');
        fs.writeFileSync('package-lock.json', '{"lockfileVersion": 2}');
        expect(detectActivePackageManager()).to.equal('yarn');
      });
    });

    describe('package.json packageManager field detection', () => {
      it('should detect pnpm from package.json packageManager field', () => {
        const fs = require('fs');
        const packageJson = { packageManager: 'pnpm@8.6.0' };
        fs.writeFileSync('package.json', JSON.stringify(packageJson));
        expect(detectActivePackageManager()).to.equal('pnpm');
      });

      it('should detect yarn from package.json packageManager field', () => {
        const fs = require('fs');
        const packageJson = { packageManager: 'yarn@1.22.19' };
        fs.writeFileSync('package.json', JSON.stringify(packageJson));
        expect(detectActivePackageManager()).to.equal('yarn');
      });

      it('should detect npm from package.json packageManager field', () => {
        const fs = require('fs');
        const packageJson = { packageManager: 'npm@9.8.0' };
        fs.writeFileSync('package.json', JSON.stringify(packageJson));
        expect(detectActivePackageManager()).to.equal('npm');
      });

      it('should prioritize lock files over package.json packageManager field', () => {
        const fs = require('fs');
        fs.writeFileSync('yarn.lock', '# yarn lockfile v1');
        const packageJson = { packageManager: 'pnpm@8.6.0' };
        fs.writeFileSync('package.json', JSON.stringify(packageJson));
        expect(detectActivePackageManager()).to.equal('yarn');
      });
    });

    describe('npm_execpath fallback detection', () => {
      [
        ['yarn', '/path/to/yarn.js'],
        ['pnpm', '/path/to/pnpm.cjs'],
        ['npm', '/path/to/npx-cli.js'],
        ['npm', '/path/to/npm-cli.js'],
      ].forEach(([packageManager, npmExecpath]) => {
        it(`should detect ${packageManager} when npm_execpath contains ${npmExecpath}`, () => {
          process.env.npm_execpath = npmExecpath;
          expect(detectActivePackageManager()).to.equal(packageManager);
        });
      });

      it('should default to npm when npm_execpath is undefined', () => {
        delete process.env.npm_execpath;
        expect(detectActivePackageManager()).to.equal('npm');
      });

      it('should default to npm when npm_execpath is empty string', () => {
        process.env.npm_execpath = '';
        expect(detectActivePackageManager()).to.equal('npm');
      });

      it('should default to npm for unknown execpath', () => {
        process.env.npm_execpath = '/path/to/unknown-package-manager.js';
        expect(detectActivePackageManager()).to.equal('npm');
      });

      it('should fall back to npm_execpath when package.json is invalid', () => {
        const fs = require('fs');
        fs.writeFileSync('package.json', 'invalid json');
        process.env.npm_execpath = '/path/to/yarn.js';
        expect(detectActivePackageManager()).to.equal('yarn');
      });

      it('should fall back to npm_execpath when package.json has no packageManager field', () => {
        const fs = require('fs');
        const packageJson = { name: 'test-app', version: '1.0.0' };
        fs.writeFileSync('package.json', JSON.stringify(packageJson));
        process.env.npm_execpath = '/path/to/pnpm.cjs';
        expect(detectActivePackageManager()).to.equal('pnpm');
      });
    });

    describe('priority and edge cases', () => {
      it('should prioritize lock files over package.json over npm_execpath', () => {
        const fs = require('fs');
        fs.writeFileSync('yarn.lock', '# yarn lockfile v1');
        const packageJson = { packageManager: 'pnpm@8.6.0' };
        fs.writeFileSync('package.json', JSON.stringify(packageJson));
        process.env.npm_execpath = '/path/to/npm-cli.js';
        expect(detectActivePackageManager()).to.equal('yarn');
      });

      it('should prioritize package.json over npm_execpath when no lock files exist', () => {
        const fs = require('fs');
        const packageJson = { packageManager: 'pnpm@8.6.0' };
        fs.writeFileSync('package.json', JSON.stringify(packageJson));
        process.env.npm_execpath = '/path/to/yarn.js';
        expect(detectActivePackageManager()).to.equal('pnpm');
      });
    });
  });

  describe('getNormalizedPackageManager', () => {
    describe('when no package manager options are provided', () => {
      packageManagers.forEach((activePackageManager) => {
        it(`returns ${activePackageManager} when active package manager is ${activePackageManager}`, () => {
          expect(getNormalizedPackageManager({}, activePackageManager as PackageManager)).to.equal(
            activePackageManager
          );
        });
      });
    });

    describe('when yarn option is true', () => {
      packageManagers.forEach((activePackageManager) => {
        it(`returns "yarn" when active package manager is ${activePackageManager}`, () => {
          expect(
            getNormalizedPackageManager({ yarn: true }, activePackageManager as PackageManager)
          ).to.equal('yarn');
        });
      });
    });

    describe('when pnpm option is true', () => {
      packageManagers.forEach((activePackageManager) => {
        it(`returns "pnpm" when active package manager is ${activePackageManager}`, () => {
          expect(
            getNormalizedPackageManager({ pnpm: true }, activePackageManager as PackageManager)
          ).to.equal('pnpm');
        });
      });
    });

    describe('when npm option is true', () => {
      packageManagers.forEach((activePackageManager) => {
        it(`returns "npm" when active package manager is ${activePackageManager}`, () => {
          expect(
            getNormalizedPackageManager({ npm: true }, activePackageManager as PackageManager)
          ).to.equal('npm');
        });
      });
    });
  });

  describe('normalizeOptions', () => {
    let originalNpmExecpath: string | undefined;
    let originalCwd: string;
    let tempDir: string;

    beforeEach(() => {
      originalNpmExecpath = process.env.npm_execpath;
      originalCwd = process.cwd();

      // Create temporary directory for each test
      const fs = require('fs');
      const os = require('os');
      const path = require('path');
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'normalize-test-'));
      process.chdir(tempDir);
    });

    afterEach(() => {
      // Restore environment
      if (originalNpmExecpath) {
        process.env.npm_execpath = originalNpmExecpath;
      } else {
        delete process.env.npm_execpath;
      }

      // Restore working directory and cleanup
      process.chdir(originalCwd);
      try {
        const fs = require('fs');
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (error) {
        // Ignore cleanup errors
      }
    });

    describe('no package manager options are provided', () => {
      [
        ['yarn', '/path/to/yarn.js'],
        ['pnpm', '/path/to/pnpm.cjs'],
        ['npm', '/path/to/npx-cli.js'],
      ].forEach(([activePackageManager, npmExecpath]) => {
        it(`falls back to ${activePackageManager} when that is the active package manager`, () => {
          // Set npm_execpath to force detection to use fallback
          process.env.npm_execpath = npmExecpath;
          const options: CLIOptions = {};
          const result = normalizeOptions(options);
          packageManagers.forEach((packageManager) => {
            if (packageManager === activePackageManager) {
              expect(result[activePackageManager]).to.be.true;
            } else {
              expect(result[packageManager]).to.be.undefined;
            }
          });
        });
      });

      it('falls back to detected package manager from lock files', () => {
        const fs = require('fs');
        fs.writeFileSync('yarn.lock', '# yarn lockfile v1');

        const options: CLIOptions = {};
        const result = normalizeOptions(options);

        expect(result.yarn).to.be.true;
        expect(result.npm).to.be.undefined;
        expect(result.pnpm).to.be.undefined;
      });

      it('falls back to detected package manager from package.json', () => {
        const fs = require('fs');
        const packageJson = { packageManager: 'pnpm@8.6.0' };
        fs.writeFileSync('package.json', JSON.stringify(packageJson));

        const options: CLIOptions = {};
        const result = normalizeOptions(options);

        expect(result.pnpm).to.be.true;
        expect(result.npm).to.be.undefined;
        expect(result.yarn).to.be.undefined;
      });
    });

    describe('one package manager option is provided', () => {
      packageManagers.forEach((packageManager) => {
        it(`selects ${packageManager} when that is the only option provided`, () => {
          const options: CLIOptions = { [packageManager]: true };
          const result = normalizeOptions(options);
          packageManagers.forEach((p) => {
            if (p === packageManager) {
              expect(result[p]).to.be.true;
            } else {
              expect(result[p]).to.be.undefined;
            }
          });
        });
      });
    });

    describe('multiple package manager options are provided', () => {
      it('falls back to the active package manager', () => {
        process.env.npm_execpath = '/path/to/yarn.js'; // Sets yarn as the active package manager
        const options: CLIOptions = { npm: true, pnpm: true };
        const result = normalizeOptions(options);
        expect(result.npm).to.be.undefined;
        expect(result.pnpm).to.be.undefined;
        expect(result.yarn).to.be.true;
      });
    });
  });
});
