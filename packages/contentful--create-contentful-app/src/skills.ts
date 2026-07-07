import inquirer from 'inquirer';
import { spawn } from 'child_process';
import { CLIOptions } from './types';
import { choice, highlight, success, warn } from './logger';

export const SKILLS_SOURCE = 'contentful/skills';
export const APP_BUILDING_SKILL = 'contentful-custom-app-from-scratch';

/**
 * The command a user can run manually to install the skill later. Kept in sync
 * with the arguments passed to the default runner below.
 */
export const MANUAL_INSTALL_COMMAND = `npx skills add ${SKILLS_SOURCE} --skill ${APP_BUILDING_SKILL}`;

/**
 * Runs the skill installer in the given app folder. Resolves on success and
 * rejects on failure. Injectable so it can be stubbed in tests.
 */
export type SkillRunner = (appFolder: string) => Promise<void>;

const defaultRunner: SkillRunner = (appFolder: string) =>
  new Promise<void>((resolve, reject) => {
    const child = spawn(
      'npx',
      ['-y', 'skills', 'add', SKILLS_SOURCE, '--skill', APP_BUILDING_SKILL, '-y'],
      { stdio: 'inherit', shell: true, cwd: appFolder }
    );
    child.on('error', reject);
    child.on('exit', (exitCode) => {
      if (exitCode === 0) {
        resolve();
      } else {
        reject(new Error(`skills installer exited with code ${exitCode ?? 'unknown'}`));
      }
    });
  });

/**
 * Best-effort installation of the Contentful app-building skill into a scaffolded
 * app. The skill is pulled live via the `skills` CLI so it is always current and
 * works across AI harnesses (Claude Code, OpenAI Codex, Cursor, and others — the
 * CLI auto-detects the active harness).
 *
 * This never throws: a failure (offline, npx error, etc.) is logged as a warning
 * with the manual command so app creation always completes.
 *
 * @returns `true` if the skill was installed, `false` if installation was skipped
 *          due to an error.
 */
export async function installAppBuildingSkill(
  appFolder: string,
  deps: { run?: SkillRunner } = {}
): Promise<boolean> {
  const run = deps.run ?? defaultRunner;

  console.log(`Installing the Contentful app-building AI skill (${highlight(APP_BUILDING_SKILL)})...`);

  try {
    await run(appFolder);
    console.log(`${success('Done!')} Added the ${highlight(APP_BUILDING_SKILL)} skill to your app.`);
    return true;
  } catch (e) {
    warn(
      `Could not install the Contentful app-building AI skill. Your app was created successfully. ` +
        `To add it later, run ${choice(MANUAL_INSTALL_COMMAND)} inside your app folder.`
    );
    return false;
  }
}

/**
 * Prompts the user (interactive mode only) whether to include the app-building
 * skill. Defaults to yes.
 */
export async function promptIncludeSkill(): Promise<boolean> {
  const { includeSkill } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'includeSkill',
      message: 'Include the Contentful app-building AI skill?',
      default: true,
    },
  ]);
  return includeSkill;
}

/**
 * Resolves whether the app-building skill should be installed.
 *
 * - An explicit opt-out (`--skip-skills`, or commander's `--no-skills` which sets
 *   `skills: false`) always wins and never prompts.
 * - In interactive mode, the user is prompted (default yes).
 * - In non-interactive / flagged runs, the skill is installed by default.
 */
export async function resolveShouldIncludeSkill(
  options: CLIOptions,
  isInteractive: boolean,
  prompt: () => Promise<boolean> = promptIncludeSkill
): Promise<boolean> {
  if (options.skipSkills === true || options.skills === false) {
    return false;
  }

  if (isInteractive) {
    return prompt();
  }

  return true;
}
