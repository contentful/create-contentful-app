export type CLIOptions = Partial<{
  npm: boolean;
  yarn: boolean;
  javascript: boolean;
  typescript: boolean;
  source: string;
  example: string;
  action: boolean;
  function: string | boolean;
  legacy: boolean;
  next: boolean;
  version: string;
}>;

export const ContentfulExample = {
  Javascript: 'javascript',
  Typescript: 'typescript',
};

export class InvalidTemplateError extends Error {}
export class HTTPResponseError extends Error {}
