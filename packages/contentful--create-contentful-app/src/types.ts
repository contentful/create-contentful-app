export type CLIOptions = Partial<{
  npm: boolean;
  yarn: boolean;
  pnpm: boolean;
  javascript: boolean;
  typescript: boolean;
  source: string;
  example: string;
  function: string | boolean;
  skipUi: boolean;
  skipSkills: boolean;
  // Set to `false` by commander's `--no-skills` flag; opts out of skill install.
  skills: boolean;
}>;

export type PackageManager = 'npm' | 'yarn' | 'pnpm';

export const ContentfulExample = {
  Javascript: 'javascript',
  Typescript: 'typescript',
};

export class InvalidTemplateError extends Error {}
export class HTTPResponseError extends Error {}
