export type CLIOptions = Partial<{
  create: string | boolean;
  javascript: boolean;
  typescript: boolean;
  source: string;
}>;

export class InvalidCLIOptionsError extends Error {}
export class InvalidTemplateError extends Error {}
export class HTTPResponseError extends Error {}
