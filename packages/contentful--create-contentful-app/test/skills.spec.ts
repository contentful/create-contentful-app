import { expect } from 'chai';
import sinon from 'sinon';
import {
  installAppBuildingSkill,
  resolveShouldIncludeSkill,
  MANUAL_INSTALL_COMMAND,
} from '../src/skills';
import type { CLIOptions } from '../src/types';

describe('skills', () => {
  describe('installAppBuildingSkill', () => {
    let consoleLogSpy;

    beforeEach(() => {
      consoleLogSpy = sinon.spy(console, 'log');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('returns true and runs the installer in the app folder on success', async () => {
      const run = sinon.stub().resolves();

      const result = await installAppBuildingSkill('/tmp/my-app', { run });

      expect(result).to.be.true;
      expect(run.calledOnceWith('/tmp/my-app')).to.be.true;
    });

    it('returns false and warns with the manual command when the installer fails', async () => {
      const run = sinon.stub().rejects(new Error('offline'));

      const result = await installAppBuildingSkill('/tmp/my-app', { run });

      expect(result).to.be.false;
      const logged = consoleLogSpy.getCalls().map((c) => c.args[0]);
      const warning = logged.find((line) => typeof line === 'string' && line.includes('Warning'));
      expect(warning, 'a warning should be logged').to.exist;
      expect(warning).to.include(MANUAL_INSTALL_COMMAND);
    });

    it('does not throw when the installer rejects', async () => {
      const run = sinon.stub().rejects(new Error('boom'));
      // Should resolve (to false), never reject.
      await expect(installAppBuildingSkill('/tmp/my-app', { run })).to.eventually.equal(false);
    });
  });

  describe('resolveShouldIncludeSkill', () => {
    it('returns false without prompting when --skip-skills is set', async () => {
      const prompt = sinon.stub().resolves(true);
      const options: CLIOptions = { skipSkills: true };

      const result = await resolveShouldIncludeSkill(options, true, prompt);

      expect(result).to.be.false;
      expect(prompt.notCalled).to.be.true;
    });

    it('returns false without prompting when --no-skills sets skills to false', async () => {
      const prompt = sinon.stub().resolves(true);
      const options: CLIOptions = { skills: false };

      const result = await resolveShouldIncludeSkill(options, true, prompt);

      expect(result).to.be.false;
      expect(prompt.notCalled).to.be.true;
    });

    it('prompts in interactive mode and honors a yes answer', async () => {
      const prompt = sinon.stub().resolves(true);

      const result = await resolveShouldIncludeSkill({}, true, prompt);

      expect(result).to.be.true;
      expect(prompt.calledOnce).to.be.true;
    });

    it('prompts in interactive mode and honors a no answer', async () => {
      const prompt = sinon.stub().resolves(false);

      const result = await resolveShouldIncludeSkill({}, true, prompt);

      expect(result).to.be.false;
      expect(prompt.calledOnce).to.be.true;
    });

    it('defaults to true without prompting in non-interactive mode', async () => {
      const prompt = sinon.stub().resolves(false);

      const result = await resolveShouldIncludeSkill({}, false, prompt);

      expect(result).to.be.true;
      expect(prompt.notCalled).to.be.true;
    });
  });
});
