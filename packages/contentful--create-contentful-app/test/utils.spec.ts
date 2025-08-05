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

    beforeEach(() => {
      originalNpmExecpath = process.env.npm_execpath;
    });

    afterEach(() => {
      if (originalNpmExecpath) {
        process.env.npm_execpath = originalNpmExecpath;
      } else {
        delete process.env.npm_execpath;
      }
    });

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

    beforeEach(() => {
      originalNpmExecpath = process.env.npm_execpath;
    });

    afterEach(() => {
      if (originalNpmExecpath) {
        process.env.npm_execpath = originalNpmExecpath;
      } else {
        delete process.env.npm_execpath;
      }
    });

    describe('no package manager options are provided', () => {
      [
        ['yarn', '/path/to/yarn.js'],
        ['pnpm', '/path/to/pnpm.cjs'],
        ['npm', '/path/to/npx-cli.js'],
      ].forEach(([activePackageManager, npmExecpath]) => {
        it(`falls back to ${activePackageManager} when that is the active package manager`, () => {
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
